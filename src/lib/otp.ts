import crypto from "node:crypto";
import { getPayloadClient } from "@/lib/payload";
import { env } from "@/lib/env";

const TTL_MIN = 5;
const MAX_ATTEMPTS = 5;
const MAX_PER_HOUR = 6;

const hashCode = (phone: string, code: string) =>
  crypto.createHash("sha256").update(`${phone}:${code}:${env.PAYLOAD_SECRET}`).digest("hex");

export async function issueOtp(
  phone: string,
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const payload = await getPayloadClient();
  const since = new Date(Date.now() - 3600_000).toISOString();
  const recent = await payload.count({
    collection: "otpRequests",
    overrideAccess: true,
    where: { and: [{ phone: { equals: phone } }, { createdAt: { greater_than: since } }] },
  });
  if (recent.totalDocs >= MAX_PER_HOUR) return { ok: false, error: "too_many" };

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await payload.create({
    collection: "otpRequests",
    overrideAccess: true,
    data: {
      phone,
      codeHash: hashCode(phone, code),
      expiresAt: new Date(Date.now() + TTL_MIN * 60_000).toISOString(),
      attempts: 0,
      consumed: false,
    },
  });
  return { ok: true, code };
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
    data: { consumed: true },
  });
  return { ok: true };
}
