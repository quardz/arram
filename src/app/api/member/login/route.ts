import { NextResponse } from "next/server";
import { findPersonByPhone, activeAssignmentCount, normalizePhone } from "@/lib/member";
import { verifyMemberPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { TEST_LOGIN } from "@/lib/testlogin";
import { audit } from "@/lib/audit";

// Password login: phone + password on one screen. The phone must be an active
// org member; the password is the deterministic member password (last 8 hex of
// sha256 of the 10-digit phone).
export async function POST(req: Request) {
  let phone = "";
  try {
    const body = await req.json().catch(() => ({}));
    phone = normalizePhone(String(body?.phone || ""));
    const password = String(body?.password || "").trim().toLowerCase();

    if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 });
    if (!password) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });

    // TEST bypass (kept for bring-up): fixed phone + code signs in as the member.
    if (TEST_LOGIN.enabled && phone === TEST_LOGIN.phone && password === TEST_LOGIN.code) {
      const tp = await findPersonByPhone(TEST_LOGIN.loginAsPhone);
      if (!tp) return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
      await setSessionCookie(await createSessionToken({ personId: tp.id as number, phone: tp.phone }));
      await audit({ actorId: tp.id as number, action: "login", detail: "test-login" });
      console.log(`[login] password test-login → ${TEST_LOGIN.loginAsPhone}`);
      return NextResponse.json({ ok: true });
    }

    const person = await findPersonByPhone(phone);
    if (!person) {
      console.warn(`[login] password not_member (no person) phone=${phone}`);
      return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });
    }
    if ((await activeAssignmentCount(person.id as number)) < 1) {
      console.warn(`[login] password not_member (no active assignment) phone=${phone} personId=${person.id}`);
      return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });
    }
    if (!verifyMemberPassword(phone, password)) {
      console.warn(`[login] password wrong phone=${phone}`);
      return NextResponse.json({ ok: false, error: "wrong_password" }, { status: 401 });
    }

    await setSessionCookie(await createSessionToken({ personId: person.id as number, phone }));
    await audit({ actorId: person.id as number, action: "login", detail: phone });
    // Stamp last login. Only real logins pass through here — admin impersonation
    // sets the session token directly and never touches this, so "view as" does
    // not count as the member logging in.
    try {
      const { getPayloadClient } = await import("@/lib/payload");
      const payload = await getPayloadClient();
      await (payload as unknown as { update: (a: unknown) => Promise<unknown> }).update({
        collection: "people", id: person.id as number, overrideAccess: true,
        data: { lastLoginAt: new Date().toISOString() },
      });
    } catch (e) { console.warn(`[login] lastLoginAt update failed personId=${person.id}`, (e as Error)?.message); }
    console.log(`[login] password success phone=${phone} personId=${person.id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`[login] password EXCEPTION phone=${phone}`, e);
    return NextResponse.json({ ok: false, error: "server_error", detail: (e as Error)?.message }, { status: 500 });
  }
}
