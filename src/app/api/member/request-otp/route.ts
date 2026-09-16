import { NextResponse } from "next/server";
import { issueOtp, markOtpDelivery } from "@/lib/otp";
import { sendOtpSms } from "@/lib/fast2sms";
import { findPersonByPhone, activeAssignmentCount, normalizePhone } from "@/lib/member";
import { TEST_LOGIN } from "@/lib/testlogin";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(body?.phone || ""));
  if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 });

  // TEST login bypass: allow the test phone to advance to the OTP step.
  if (TEST_LOGIN.enabled && phone === TEST_LOGIN.phone) return NextResponse.json({ ok: true });

  const person = await findPersonByPhone(phone);
  if (!person) return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });
  if ((await activeAssignmentCount(person.id as number)) < 1)
    return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });

  const issued = await issueOtp(phone);
  if (!issued.ok) return NextResponse.json({ ok: false, error: issued.error }, { status: 429 });

  const sent = await sendOtpSms(phone, issued.code, issued.message);
  // Record the delivery outcome on the logged OTP row (best-effort).
  await markOtpDelivery(issued.id, sent.ok ? "sent" : "failed", sent.provider);
  if (!sent.ok) return NextResponse.json({ ok: false, error: sent.error || "generic" }, { status: 502 });
  return NextResponse.json({ ok: true, ...(sent.devCode ? { devCode: sent.devCode } : {}) });
}

// Lightweight health/diagnostic (GET): confirms this build is live and the
// active OTP configuration. Safe: exposes only booleans + non-secret config
// (never the API key or any code). Remove before public launch.
export async function GET() {
  return NextResponse.json({
    ok: true,
    marker: "otp-diag-4",
    testLoginEnabled: TEST_LOGIN.enabled,
    testPhone: TEST_LOGIN.phone,
    smsProvider: env.SMS_PROVIDER,
    otpLength: env.OTP_LENGTH,
    otpTtlSeconds: env.OTP_TTL_SECONDS,
    fast2smsConfigured: Boolean(env.FAST2SMS_API_KEY),
  });
}
