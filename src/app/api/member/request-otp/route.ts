import { NextResponse } from "next/server";
import { issueOtp, markOtpDelivery } from "@/lib/otp";
import { sendOtpSms } from "@/lib/fast2sms";
import { findPersonByPhone, activeAssignmentCount, normalizePhone } from "@/lib/member";
import { TEST_LOGIN } from "@/lib/testlogin";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  let phone = "";
  try {
    const body = await req.json().catch(() => ({}));
    phone = normalizePhone(String(body?.phone || ""));
    if (!/^[6-9]\d{9}$/.test(phone)) {
      console.warn(`[login] request-otp bad_phone raw="${String(body?.phone || "")}"`);
      return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 });
    }

    // TEST login bypass: allow the test phone to advance to the OTP step.
    if (TEST_LOGIN.enabled && phone === TEST_LOGIN.phone) {
      console.log(`[login] request-otp test-phone ${phone} → advance`);
      return NextResponse.json({ ok: true });
    }

    const person = await findPersonByPhone(phone);
    if (!person) {
      console.warn(`[login] request-otp not_member (no person) phone=${phone}`);
      return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });
    }
    const assignments = await activeAssignmentCount(person.id as number);
    if (assignments < 1) {
      console.warn(`[login] request-otp not_member (no active assignment) phone=${phone} personId=${person.id}`);
      return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });
    }

    const issued = await issueOtp(phone);
    if (!issued.ok) {
      console.warn(`[login] request-otp issue failed phone=${phone} error=${issued.error}`);
      return NextResponse.json({ ok: false, error: issued.error }, { status: 429 });
    }

    const sent = await sendOtpSms(phone, issued.code, issued.message);
    await markOtpDelivery(issued.id, sent.ok ? "sent" : "failed", sent.provider);
    console.log(`[login] request-otp phone=${phone} provider=${sent.provider} sent=${sent.ok}${sent.error ? ` error=${JSON.stringify(sent.error)}` : ""}`);
    if (!sent.ok) {
      // Stable code for the UI + the raw provider reason for logs/debugging.
      return NextResponse.json({ ok: false, error: "sms_failed", detail: sent.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true, ...(sent.devCode ? { devCode: sent.devCode } : {}) });
  } catch (e) {
    console.error(`[login] request-otp EXCEPTION phone=${phone}`, e);
    return NextResponse.json({ ok: false, error: "server_error", detail: (e as Error)?.message }, { status: 500 });
  }
}

// Lightweight health/diagnostic (GET): confirms this build is live and the
// active OTP configuration. Safe: exposes only booleans + non-secret config
// (never the API key or any code). Remove before public launch.
export async function GET() {
  return NextResponse.json({
    ok: true,
    marker: "otp-diag-5",
    testLoginEnabled: TEST_LOGIN.enabled,
    testPhone: TEST_LOGIN.phone,
    smsProvider: env.SMS_PROVIDER,
    otpLength: env.OTP_LENGTH,
    otpTtlSeconds: env.OTP_TTL_SECONDS,
    fast2smsConfigured: Boolean(env.FAST2SMS_API_KEY),
  });
}
