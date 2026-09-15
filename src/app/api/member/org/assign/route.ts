import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";
import { normalizePhone } from "@/lib/member";
import { ROLE_VALUES } from "@/lib/org";
import type { OrgAssignment, Person } from "@/payload-types";

// Assign a member (by phone) to a geo node with a designation. state_admin only.
// Finds or creates the person by phone; creates an active org assignment.
export async function POST(req: Request) {
  const admin = await requireAdminActor();
  if (!admin) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const nodeId = Number(body?.nodeId);
  const phone = normalizePhone(String(body?.phone || ""));
  const name = String(body?.name || "").trim();
  const role = String(body?.role || "");
  if (!nodeId || !/^[6-9]\d{9}$/.test(phone) || !ROLE_VALUES.includes(role))
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });

  const payload = await getPayloadClient();
  const existing = await payload.find({ collection: "people", overrideAccess: true, limit: 1, where: { phone: { equals: phone } } });
  let person = existing.docs[0] as Person | undefined;
  if (person) {
    if (name && (!person.name || person.name === "multiple")) {
      person = (await payload.update({ collection: "people", id: person.id, overrideAccess: true, data: { name } })) as Person;
    }
  } else {
    person = (await payload.create({
      collection: "people", overrideAccess: true,
      data: { phone, name: name || phone, geoNode: nodeId, source: "org-added", otpVerified: false },
    })) as Person;
  }

  // avoid a duplicate active assignment of the same person+node+role
  const dup = await payload.find({
    collection: "orgAssignments", overrideAccess: true, limit: 1,
    where: { and: [{ person: { equals: person.id } }, { geoNode: { equals: nodeId } }, { role: { equals: role } }, { active: { equals: true } }] },
  });
  let assignmentId: number;
  if (dup.docs[0]) {
    assignmentId = dup.docs[0].id as number;
  } else {
    const a = await payload.create({
      collection: "orgAssignments", overrideAccess: true,
      data: { person: person.id, geoNode: nodeId, role: role as OrgAssignment["role"], active: true, assignedBy: admin.person.id },
    });
    assignmentId = a.id as number;
  }
  const nm = person.name && person.name !== "multiple" ? person.name : person.phone;
  return NextResponse.json({ ok: true, assignment: { id: assignmentId, nodeId, personId: person.id, name: nm, phone: person.phone, role } });
}
