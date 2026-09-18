import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";
import { audit, auditActor } from "@/lib/audit";
import type { Event } from "@/payload-types";

// Delete a whole campaign (parent + its district sessions + all their attendance)
// or a local attendance event (+ its records). State/super admin only.
// A single campaign_session is NOT deletable on its own (it belongs to a campaign).
export async function POST(req: Request) {
  const admin = await requireAdminActor();
  if (!admin) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const eventId = Number(body?.eventId);
  if (!eventId) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });

  const payload = await getPayloadClient();
  const ev = (await payload.findByID({ collection: "events", id: eventId, overrideAccess: true, depth: 0 }).catch(() => null)) as Event | null;
  if (!ev) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const kind = ev.kind as string;
  if (kind !== "campaign_parent" && kind !== "local")
    return NextResponse.json({ ok: false, error: "not_deletable" }, { status: 400 });

  // Collect every event whose attendance must go: the target, plus child sessions.
  const eventIds = [eventId];
  if (kind === "campaign_parent") {
    const sessions = await payload.find({ collection: "events", overrideAccess: true, depth: 0, limit: 5000, where: { parentEvent: { equals: eventId } } });
    for (const s of sessions.docs) eventIds.push(s.id as number);
  }

  // Attendance rows first (FK-safe), then the events, then the target/parent.
  await payload.delete({ collection: "attendance", overrideAccess: true, where: { event: { in: eventIds } } });
  if (eventIds.length > 1) {
    const childIds = eventIds.filter((x) => x !== eventId);
    await payload.delete({ collection: "events", overrideAccess: true, where: { id: { in: childIds } } });
  }
  await payload.delete({ collection: "events", overrideAccess: true, id: eventId });

  const ctx = await auditActor();
  if (ctx) await audit({ ...ctx, action: "delete_session", eventId, detail: `${kind} "${ev.name}" (+${eventIds.length - 1} sessions)` });

  return NextResponse.json({ ok: true, deletedEvents: eventIds.length });
}
