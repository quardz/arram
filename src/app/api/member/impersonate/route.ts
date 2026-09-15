import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { loadMemberById } from "@/lib/member";
import { requireAdminActor } from "@/lib/impersonate";
import { audit } from "@/lib/audit";

// Start impersonation: state_admin only. Session becomes the target member,
// remembering the admin as the real actor.
export async function POST(req: Request) {
  const admin = await requireAdminActor();
  if (!admin) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const personId = Number(body?.personId);
  if (!personId) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  if (personId === (admin.person.id as number)) return NextResponse.json({ ok: false, error: "self" }, { status: 400 });
  const target = await loadMemberById(personId);
  if (!target) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  await setSessionCookie(await createSessionToken({
    personId: target.person.id as number,
    phone: target.person.phone,
    act: { personId: admin.person.id as number, phone: admin.person.phone },
  }));
  const nm = target.person.name && target.person.name !== "multiple" ? target.person.name : target.person.phone;
  await audit({
    actorId: admin.person.id as number, actorRole: "state_admin", action: "impersonate_start",
    impersonatedPersonId: target.person.id as number, detail: nm,
  });
  return NextResponse.json({ ok: true });
}
