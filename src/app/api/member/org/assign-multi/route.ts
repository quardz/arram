import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";
import { ROLE_VALUES } from "@/lib/org";
import type { OrgAssignment } from "@/payload-types";

// Attach an EXISTING member to several units at once with one role. State admin
// only. A member may hold many nodes/roles (e.g. a region organiser who also
// covers multiple districts); this stacks assignments. Duplicates (same
// person+node+role, active) are reused, not re-created.
const MAX_NODES = 200;

export async function POST(req: Request) {
  const admin = await requireAdminActor();
  if (!admin) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const personId = Number(body?.personId);
  const role = String(body?.role || "");
  const rawIds: unknown[] = Array.isArray(body?.nodeIds) ? body.nodeIds : [];
  const nodeIds: number[] = [...new Set(rawIds.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0))].slice(0, MAX_NODES);
  if (!personId || !ROLE_VALUES.includes(role) || !nodeIds.length)
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });

  const payload = await getPayloadClient();
  const person = await payload.findByID({ collection: "people", id: personId, overrideAccess: true, depth: 0 }).catch(() => null);
  if (!person) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const created: { id: number; nodeId: number; role: string }[] = [];
  for (const nodeId of nodeIds) {
    const dup = await payload.find({
      collection: "orgAssignments", overrideAccess: true, limit: 1,
      where: { and: [{ person: { equals: personId } }, { geoNode: { equals: nodeId } }, { role: { equals: role } }, { active: { equals: true } }] },
    });
    if (dup.docs[0]) { created.push({ id: dup.docs[0].id as number, nodeId, role }); continue; }
    const a = await payload.create({
      collection: "orgAssignments", overrideAccess: true,
      data: { person: personId, geoNode: nodeId, role: role as OrgAssignment["role"], active: true, assignedBy: admin.person.id },
    });
    created.push({ id: a.id as number, nodeId, role });
  }

  return NextResponse.json({ ok: true, personId, created });
}
