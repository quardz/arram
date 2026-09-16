import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";
import { audit, auditActor } from "@/lib/audit";

// Create a funnel campaign (state leader / super admin only). Stored as a
// campaign_parent event; the Events afterChange hook fans it out to one session
// per DISTRICT (attendance is always taken at district level). Optional
// funnelParent restricts each session's pool to people present in that earlier
// campaign.
export async function POST(req: Request) {
  const admin = await requireAdminActor();
  if (!admin) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const takerLevel = "district"; // attendance is always district-level
  const startAt = body?.startAt ? new Date(String(body.startAt)) : null;
  const endAt = body?.endAt ? new Date(String(body.endAt)) : null;
  const funnelParentId = body?.funnelParentId ? Number(body.funnelParentId) : undefined;

  if (!name) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  if (!startAt || !endAt || isNaN(+startAt) || isNaN(+endAt) || +endAt <= +startAt)
    return NextResponse.json({ ok: false, error: "bad_window" }, { status: 400 });

  const payload = await getPayloadClient();

  // Resolve scope: an explicit scope node, else the state root (whole org).
  let scopeId = body?.scopeNodeId ? Number(body.scopeNodeId) : undefined;
  if (!scopeId) {
    const root = await payload.find({
      collection: "geoNodes", overrideAccess: true, depth: 0, limit: 1, sort: "id",
      where: { level: { equals: "state" } },
    });
    scopeId = root.docs[0]?.id as number | undefined;
  }
  if (!scopeId) return NextResponse.json({ ok: false, error: "no_scope" }, { status: 400 });

  // Validate the funnel parent is an existing campaign.
  if (funnelParentId != null) {
    const p = await payload.findByID({ collection: "events", id: funnelParentId, overrideAccess: true, depth: 0 }).catch(() => null);
    if (!p || (p as { kind?: string }).kind !== "campaign_parent")
      return NextResponse.json({ ok: false, error: "bad_parent" }, { status: 400 });
  }

  const ev = await payload.create({
    collection: "events", overrideAccess: true,
    data: {
      name, kind: "campaign_parent", geoNode: scopeId,
      takerLevel, startAt: startAt.toISOString(), endAt: endAt.toISOString(),
      date: startAt.toISOString(),
      funnelParent: funnelParentId,
      createdBy: admin.person.id as number,
    } as unknown as { name: string; kind: "campaign_parent" },
  });

  const ctx = await auditActor();
  if (ctx) await audit({ ...ctx, action: "create_session", eventId: ev.id as number, detail: `campaign: ${name} · ${takerLevel}` });
  return NextResponse.json({ ok: true, id: ev.id });
}
