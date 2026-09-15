import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";
import { normalizePhone } from "@/lib/member";
import type { Person } from "@/payload-types";

// Edit a member's name / phone. state_admin only.
export async function POST(req: Request) {
  const admin = await requireAdminActor();
  if (!admin) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const personId = Number(body?.personId);
  const name = String(body?.name || "").trim();
  const phone = normalizePhone(String(body?.phone || ""));
  if (!personId || !name || !/^[6-9]\d{9}$/.test(phone))
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const payload = await getPayloadClient();
  // phone must stay unique
  const clash = await payload.find({ collection: "people", overrideAccess: true, limit: 1, where: { and: [{ phone: { equals: phone } }, { id: { not_equals: personId } }] } });
  if (clash.docs[0]) return NextResponse.json({ ok: false, error: "phone_taken" }, { status: 409 });
  const p = (await payload.update({ collection: "people", id: personId, overrideAccess: true, data: { name, phone } })) as Person;
  return NextResponse.json({ ok: true, person: { personId: p.id, name: p.name, phone: p.phone } });
}
