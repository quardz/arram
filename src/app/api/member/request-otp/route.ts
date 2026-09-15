import { NextResponse } from "next/server";
import { issueOtp } from "@/lib/otp";
import { sendOtpSms } from "@/lib/fast2sms";
import { findPersonByPhone, activeAssignmentCount, normalizePhone } from "@/lib/member";
import { TEST_LOGIN } from "@/lib/testlogin";

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
  const sent = await sendOtpSms(phone, issued.code);
  if (!sent.ok) return NextResponse.json({ ok: false, error: sent.error || "generic" }, { status: 502 });
  return NextResponse.json({ ok: true, ...(sent.devCode ? { devCode: sent.devCode } : {}) });
}

// Lightweight diagnostic (GET): build liveness, test-login state, login-as
// member resolution, and people/geo counts (for import verification).
export async function GET() {
  const out: Record<string, unknown> = {
    ok: true,
    marker: "otp-diag-3",
    testLoginEnabled: TEST_LOGIN.enabled,
    testPhone: TEST_LOGIN.phone,
    loginAsPhone: TEST_LOGIN.loginAsPhone,
  };
  try {
    const tp = await findPersonByPhone(TEST_LOGIN.loginAsPhone);
    out.loginAsFound = !!tp;
    if (tp) {
      out.loginAsId = tp.id;
      out.loginAsName = tp.name;
      out.loginAsAssignments = await activeAssignmentCount(tp.id as number);
    }
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    out.peopleCount = (await payload.count({ collection: "people", overrideAccess: true })).totalDocs;
    out.peopleWithGeoNode = (
      await payload.count({ collection: "people", overrideAccess: true, where: { geoNode: { exists: true } } })
    ).totalDocs;
  } catch (e) {
    out.lookupError = e instanceof Error ? e.message : String(e);
  }
  return NextResponse.json(out);
}
