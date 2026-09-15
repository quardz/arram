import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";

// Soft-remove an assignment (active=false). state_admin only.
export async function POST(req: Request) {
  const admin = await requireAdminActor();
  if (!admin) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const assignmentId = Number(body?.assignmentId);
  if (!assignmentId) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const payload = await getPayloadClient();
  await payload.update({ collection: "orgAssignments", id: assignmentId, overrideAccess: true, data: { active: false } });
  return NextResponse.json({ ok: true });
}
