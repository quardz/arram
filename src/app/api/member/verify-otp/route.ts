import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { findPersonByPhone, normalizePhone } from "@/lib/member";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { TEST_LOGIN } from "@/lib/testlogin";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(body?.phone || ""));
  const code = String(body?.code || "");

  // TEST login bypass: fixed phone+code signs in as the configured member.
  if (TEST_LOGIN.enabled && phone === TEST_LOGIN.phone && code === TEST_LOGIN.code) {
    const tp = await findPersonByPhone(TEST_LOGIN.loginAsPhone);
    if (!tp) return NextResponse.json({ ok: false, error: "generic" }, { status: 500 });
    await setSessionCookie(await createSessionToken({ personId: tp.id as number, phone: tp.phone }));
    await audit({ actorId: tp.id as number, action: "login", detail: "test-login" });
    console.log(`[test-login] signed in as ${TEST_LOGIN.loginAsPhone} via test bypass`);
    return NextResponse.json({ ok: true });
  }

  // Accept any configured OTP length (4..8 digits); the actual value is checked
  // against the stored hash, so length here is just an input sanity guard.
  if (!/^[6-9]\d{9}$/.test(phone) || !/^\d{4,8}$/.test(code))
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });

  const v = await verifyOtp(phone, code);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 401 });

  const person = await findPersonByPhone(phone);
  if (!person) return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });

  await setSessionCookie(await createSessionToken({ personId: person.id as number, phone }));
  await audit({ actorId: person.id as number, action: "login", detail: phone });
  return NextResponse.json({ ok: true });
}
