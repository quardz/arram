import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { findPersonByPhone, normalizePhone } from "@/lib/member";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { TEST_LOGIN } from "@/lib/testlogin";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  let phone = "";
  try {
    const body = await req.json().catch(() => ({}));
    phone = normalizePhone(String(body?.phone || ""));
    const code = String(body?.code || "");

    // TEST login bypass: fixed phone+code signs in as the configured member.
    if (TEST_LOGIN.enabled && phone === TEST_LOGIN.phone && code === TEST_LOGIN.code) {
      const tp = await findPersonByPhone(TEST_LOGIN.loginAsPhone);
      if (!tp) {
        console.error(`[login] verify test-login target missing: ${TEST_LOGIN.loginAsPhone}`);
        return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
      }
      await setSessionCookie(await createSessionToken({ personId: tp.id as number, phone: tp.phone }));
      await audit({ actorId: tp.id as number, action: "login", detail: "test-login" });
      console.log(`[login] verify test-login → signed in as ${TEST_LOGIN.loginAsPhone}`);
      return NextResponse.json({ ok: true });
    }

    // Accept any configured OTP length (4..8 digits); the value is checked
    // against the stored hash, so length here is just an input sanity guard.
    if (!/^[6-9]\d{9}$/.test(phone) || !/^\d{4,8}$/.test(code)) {
      console.warn(`[login] verify bad_input phone=${phone} codeLen=${code.length}`);
      return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
    }

    const v = await verifyOtp(phone, code);
    if (!v.ok) {
      console.warn(`[login] verify failed phone=${phone} error=${v.error}`);
      return NextResponse.json({ ok: false, error: v.error }, { status: 401 });
    }

    const person = await findPersonByPhone(phone);
    if (!person) {
      console.warn(`[login] verify not_member phone=${phone}`);
      return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });
    }

    await setSessionCookie(await createSessionToken({ personId: person.id as number, phone }));
    await audit({ actorId: person.id as number, action: "login", detail: phone });
    console.log(`[login] verify success phone=${phone} personId=${person.id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`[login] verify-otp EXCEPTION phone=${phone}`, e);
    return NextResponse.json({ ok: false, error: "server_error", detail: (e as Error)?.message }, { status: 500 });
  }
}
