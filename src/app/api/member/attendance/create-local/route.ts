import { NextResponse } from "next/server";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { getPayloadClient } from "@/lib/payload";
import { audit, auditActor } from "@/lib/audit";

export async function POST(req: Request) {
  const member = await getCurrentMember();
  if (!member?.assignments.length) return NextResponse.json({ ok: false }, { status: 403 });
  if (!isAdmin(member)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title || "").trim();
  const districtId = Number(body?.districtId);
  const date = body?.date ? String(body.date) : new Date().toISOString();
  if (!title || !districtId) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const mine = await myDistrictIds(member);
  if (!mine.includes(districtId)) return NextResponse.json({ ok: false, error: "not_your_district" }, { status: 403 });
  const payload = await getPayloadClient();
  const ev = await payload.create({
    collection: "events", overrideAccess: true,
    data: { name: title, kind: "local", geoNode: districtId, date, createdBy: member.person.id },
  });
  const ctx = await auditActor();
  if (ctx) await audit({ ...ctx, action: "create_session", eventId: ev.id as number, actorRole: member.assignments[0]?.role as string | undefined, detail: title });
  return NextResponse.json({ ok: true, id: ev.id });
}
