import { NextResponse } from "next/server";
import { issueOtp } from "@/lib/otp";
import { sendOtpSms } from "@/lib/fast2sms";
import { findPersonByPhone, activeAssignmentCount, normalizePhone } from "@/lib/member";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(body?.phone || ""));
  if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 });

  const person = await findPersonByPhone(phone);
  if (!person) return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });
  if ((await activeAssignmentCount(person.id as number)) < 1)
    return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });

  const issued = await issueOtp(phone);
  if (!issued.ok) return NextResponse.json({ ok: false, error: issued.error }, { status: 429 });
  const sent = await sendOtpSms(phone, issued.code);
  if (!sent.ok) return NextResponse.json({ ok: false, error: sent.error || "generic" }, { status: 502 });
  return NextResponse.json({ ok: true, ...(sent.devCode ? { devCode: sent.devCode } : {}) });
}
