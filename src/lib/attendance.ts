import { getPayloadClient } from "@/lib/payload";
import { districtIdsUnder } from "@/lib/campaign";
import type { CurrentMember } from "@/lib/member";
import type { Event, GeoNode, Person } from "@/payload-types";

const rel = (v: unknown): number | undefined =>
  v == null ? undefined : typeof v === "object" ? (v as { id?: number }).id : (v as number);

/** All district ids this member can act on (union of their assignments' subtrees). */
export async function myDistrictIds(member: CurrentMember): Promise<number[]> {
  const payload = await getPayloadClient();
  const set = new Set<number>();
  for (const a of member.assignments) {
    const nodeId = rel(a.geoNode);
    if (!nodeId) continue;
    for (const d of await districtIdsUnder(payload, nodeId)) set.add(d);
  }
  return [...set];
}

/** Load a session the member is allowed to fill, else null. */
export async function getAccessibleSession(member: CurrentMember, eventId: number) {
  const payload = await getPayloadClient();
  const ev = (await payload
    .findByID({ collection: "events", id: eventId, overrideAccess: true, depth: 1 })
    .catch(() => null)) as (Event | null);
  if (!ev) return null;
  const districtId = rel(ev.geoNode);
  const mine = await myDistrictIds(member);
  const createdByMe = rel(ev.createdBy) === member.person.id;
  if (!createdByMe && (!districtId || !mine.includes(districtId))) return null;
  return ev;
}

export type Attendee = { id: number; name: string | null; phone: string; present: boolean };

/** ALL people in the session's district, with present state for this event.
    Loaded once; the client filters locally (no per-keystroke server call). */
export async function listAttendees(ev: Event): Promise<Attendee[]> {
  const payload = await getPayloadClient();
  const districtId = rel(ev.geoNode);
  if (!districtId) return [];
  const ppl = await payload.find({
    collection: "people", overrideAccess: true, depth: 0, limit: 20000,
    where: { geoNode: { equals: districtId } }, sort: "name",
  });
  // Everyone marked present for this event (not capped to a search page).
  const present = new Set<number>();
  const at = await payload.find({
    collection: "attendance", overrideAccess: true, depth: 0, limit: 20000,
    where: { and: [{ event: { equals: ev.id } }, { present: { equals: true } }] },
  });
  for (const a of at.docs) present.add(rel((a as { person: unknown }).person) as number);
  return (ppl.docs as Person[]).map((p) => ({
    id: p.id as number, name: p.name ?? null, phone: p.phone, present: present.has(p.id as number),
  }));
}

/** Set present/absent for a person in an event (upsert). */
export async function markAttendance(ev: Event, personId: number, present: boolean, recordedBy: number) {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: "attendance", overrideAccess: true, limit: 1,
    where: { and: [{ event: { equals: ev.id } }, { person: { equals: personId } }] },
  });
  const data = { event: ev.id, person: personId, present, recordedBy, recordedAt: new Date().toISOString() };
  if (existing.docs[0]) {
    await payload.update({ collection: "attendance", id: existing.docs[0].id, overrideAccess: true, data });
  } else {
    await payload.create({ collection: "attendance", overrideAccess: true, data });
  }
}
