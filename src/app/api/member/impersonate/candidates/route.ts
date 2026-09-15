import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";
import type { GeoNode, OrgAssignment, Person } from "@/payload-types";

// Members holding a given role (state_admin only). Feeds the role→member picker.
export async function GET(req: Request) {
  const admin = await requireAdminActor();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const role = new URL(req.url).searchParams.get("role") || "";
  if (!role) return NextResponse.json({ ok: true, members: [] });
  const payload = await getPayloadClient();
  const asg = await payload.find({
    collection: "orgAssignments", overrideAccess: true, depth: 1, limit: 500,
    where: { and: [{ role: { equals: role } }, { active: { equals: true } }] }, sort: "id",
  });
  const members = (asg.docs as OrgAssignment[]).map((a) => {
    const p = typeof a.person === "object" ? (a.person as Person) : null;
    const node = typeof a.geoNode === "object" ? (a.geoNode as GeoNode) : null;
    if (!p) return null;
    return {
      personId: p.id as number,
      name: p.name && p.name !== "multiple" ? p.name : p.phone,
      phone: p.phone,
      node: node?.name ?? "",
    };
  }).filter(Boolean);
  return NextResponse.json({ ok: true, members });
}
