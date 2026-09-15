import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/member";
import { getAccessibleSession, markAttendance } from "@/lib/attendance";
import { normalizePhone } from "@/lib/member";
import { getPayloadClient } from "@/lib/payload";
import { audit, auditActor } from "@/lib/audit";

const rel = (v: unknown) => (v && typeof v === "object" ? (v as { id?: number }).id : (v as number | undefined));

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member?.assignments.length) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await ctx.params;
  const ev = await getAccessibleSession(member, Number(id));
  if (!ev) return NextResponse.json({ ok: false, error: "no_access" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const phone = normalizePhone(String(body?.phone || ""));
  if (!name || !/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const payload = await getPayloadClient();
  const districtId = rel(ev.geoNode);
  const existing = await payload.find({ collection: "people", overrideAccess: true, limit: 1, where: { phone: { equals: phone } } });
  let personId: number;
  if (existing.docs[0]) {
    personId = existing.docs[0].id as number;
  } else {
    const p = await payload.create({ collection: "people", overrideAccess: true,
      data: { phone, name, geoNode: districtId, source: "event", otpVerified: false } });
    personId = p.id as number;
  }
  await markAttendance(ev, personId, true, member.person.id as number);
  const actx = await auditActor();
  if (actx) await audit({ ...actx, action: "quickadd_person", eventId: ev.id as number, targetPersonId: personId, detail: name + " · " + phone });
  return NextResponse.json({ ok: true, personId });
}
