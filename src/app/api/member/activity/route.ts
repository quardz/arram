import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/member";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";

const nm = (p: unknown): string | null =>
  p && typeof p === "object"
    ? ((p as { name?: string; phone?: string }).name && (p as { name?: string }).name !== "multiple"
        ? (p as { name?: string }).name!
        : (p as { phone?: string }).phone ?? null)
    : null;

// GET /api/member/activity?scope=mine|all
// mine = the current (effective) member's own actions; all = state_admin only.
export async function GET(req: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ ok: false }, { status: 401 });
  const scope = new URL(req.url).searchParams.get("scope") === "all" ? "all" : "mine";
  const payload = await getPayloadClient();
  let where: Record<string, unknown> = { actor: { equals: member.person.id } };
  if (scope === "all") {
    const admin = await requireAdminActor();
    if (!admin) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    where = {};
  }
  const r = await (payload as unknown as { find: (a: unknown) => Promise<{ docs: unknown[] }> }).find({
    collection: "auditLog", overrideAccess: true, depth: 1, limit: 200, sort: "-createdAt", where,
  });
  const rows = (r.docs as Record<string, unknown>[]).map((d) => ({
    id: d.id,
    action: d.action,
    detail: (d.detail as string) ?? null,
    at: d.createdAt,
    actor: nm(d.actor),
    impersonated: nm(d.impersonatedPerson),
    event: d.event && typeof d.event === "object" ? (d.event as { name?: string }).name ?? null : null,
  }));
  return NextResponse.json({ ok: true, scope, rows });
}
