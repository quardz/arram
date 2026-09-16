import crypto from "node:crypto";
import { getPayloadClient } from "@/lib/payload";
import { env } from "@/lib/env";

const MAX_ATTEMPTS = 5;
const MAX_PER_HOUR = 6;

/** Configured OTP length, clamped to a sane 4..8 range. */
const otpLength = () => Math.min(8, Math.max(4, env.OTP_LENGTH || 6));
/** Configured OTP time-to-live in seconds (default 15 min). */
const ttlSeconds = () => (env.OTP_TTL_SECONDS > 0 ? env.OTP_TTL_SECONDS : 900);

const hashCode = (phone: string, code: string) =>
  crypto.createHash("sha256").update(`${phone}:${code}:${env.PAYLOAD_SECRET}`).digest("hex");

/** Cryptographically-random numeric code of the configured length. */
function generateCode(): string {
  const len = otpLength();
  const max = 10 ** len; // e.g. len 6 -> 1_000_000 (well within randomInt's range)
  return String(crypto.randomInt(0, max)).padStart(len, "0");
}

/** Human-readable message we log to the DB (and to the console for the
 *  "console" provider). Fast2SMS's "otp" route renders the code into a
 *  DLT-approved template on their side; this is our record of what was sent. */
export function otpMessage(code: string): string {
  const mins = Math.round(ttlSeconds() / 60);
  return `Your ASM verification code is ${code}. Valid for ${mins} minute(s). Do not share it with anyone.`;
}

export async function issueOtp(
  phone: string,
): Promise<
  | { ok: true; code: string; id: number | string; message: string }
  | { ok: false; error: string }
> {
  const payload = await getPayloadClient();
  const since = new Date(Date.now() - 3600_000).toISOString();
  const recent = await payload.count({
    collection: "otpRequests",
    overrideAccess: true,
    where: { and: [{ phone: { equals: phone } }, { createdAt: { greater_than: since } }] },
  });
  if (recent.totalDocs >= MAX_PER_HOUR) return { ok: false, error: "too_many" };

  const code = generateCode();
  const message = otpMessage(code);
  const doc = await payload.create({
    collection: "otpRequests",
    overrideAccess: true,
    // `code`, `provider`, `status` and `message` are logging fields added so
    // every issued OTP is a full record (phone + code + time + message).
    data: {
      phone,
      codeHash: hashCode(phone, code),
      expiresAt: new Date(Date.now() + ttlSeconds() * 1000).toISOString(),
      attempts: 0,
      consumed: false,
      code,
      provider: env.SMS_PROVIDER,
      status: "issued",
      message,
    } as unknown as { phone: string; codeHash: string; expiresAt: string; attempts: number; consumed: boolean },
  });
  return { ok: true, code, id: doc.id, message };
}

/** Record the delivery outcome for a logged OTP row (best-effort). */
export async function markOtpDelivery(
  id: number | string,
  status: "sent" | "failed",
  provider?: string,
): Promise<void> {
  try {
    const payload = await getPayloadClient();
    await payload.update({
      collection: "otpRequests",
      id,
      overrideAccess: true,
      data: { status, ...(provider ? { provider } : {}) } as unknown as { attempts?: number },
    });
  } catch {
    // logging is best-effort; never fail the request over it
  }
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "otpRequests",
    overrideAccess: true,
    sort: "-createdAt",
    limit: 1,
    where: {
      and: [
        { phone: { equals: phone } },
        { consumed: { equals: false } },
        { expiresAt: { greater_than: new Date().toISOString() } },
      ],
    },
  });
  const doc = res.docs[0];
  if (!doc) return { ok: false, error: "expired" };
  if ((doc.attempts ?? 0) >= MAX_ATTEMPTS) return { ok: false, error: "locked" };
  if (doc.codeHash !== hashCode(phone, code)) {
    await payload.update({
      collection: "otpRequests",
      id: doc.id,
      overrideAccess: true,
      data: { attempts: (doc.attempts ?? 0) + 1 },
    });
    return { ok: false, error: "wrong" };
  }
  await payload.update({
    collection: "otpRequests",
    id: doc.id,
    overrideAccess: true,
    data: { consumed: true, status: "verified" } as unknown as { consumed: boolean },
  });
  return { ok: true };
}
