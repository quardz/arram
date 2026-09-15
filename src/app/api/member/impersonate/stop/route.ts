import { NextResponse } from "next/server";
import { getSession, createSessionToken, setSessionCookie } from "@/lib/session";
import { audit } from "@/lib/audit";

// Stop impersonation: restore the real admin as the session.
export async function POST() {
  const s = await getSession();
  if (!s || !s.act) return NextResponse.json({ ok: false, error: "not_impersonating" }, { status: 400 });
  const was = s.personId;
  await setSessionCookie(await createSessionToken({ personId: s.act.personId, phone: s.act.phone }));
  await audit({ actorId: s.act.personId, actorRole: "state_admin", action: "impersonate_stop", impersonatedPersonId: was });
  return NextResponse.json({ ok: true });
}
