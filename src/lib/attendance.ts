import { getPayloadClient } from "@/lib/payload";
import { districtIdsUnder, presentPersonIdsInCampaign } from "@/lib/campaign";
import { isAdmin, type CurrentMember } from "@/lib/member";
import type { Event, Person } from "@/payload-types";

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

/** The exact org node ids this member holds (their assignment nodes). */
export function myNodeIds(member: CurrentMember): number[] {
  return member.assignments.map((a) => rel(a.geoNode)).filter((x): x is number => x != null);
}

/** Load a session the member is allowed to fill, else null.
 *  - local: creator, or the district is within the member's assignment subtree.
 *  - campaign_session: an admin, or the member holds the exact node the session
 *    is for (the office-holder at the campaign's taker level). */
export async function getAccessibleSession(member: CurrentMember, eventId: number) {
  const payload = await getPayloadClient();
  const ev = (await payload
    .findByID({ collection: "events", id: eventId, overrideAccess: true, depth: 1 })
    .catch(() => null)) as (Event | null);
  if (!ev) return null;
  if ((ev.kind as string) === "campaign_session") {
    if (isAdmin(member)) return ev;
    const nodeId = rel(ev.geoNode);
    return nodeId != null && myNodeIds(member).includes(nodeId) ? ev : null;
  }
  // local (and any legacy) events
  const districtId = rel(ev.geoNode);
  const mine = await myDistrictIds(member);
  const createdByMe = rel(ev.createdBy) === member.person.id;
  if (!createdByMe && (!districtId || !mine.includes(districtId))) return null;
  return ev;
}

export type Attendee = { id: number; name: string | null; phone: string; present: boolean; union: string | null; pincode: string | null };

/** People this member can mark for a session, with present state, loaded once.
 *  - Area = every district under the session's node (district session → that
 *    district; region/state session → all districts beneath it).
 *  - If the session has a funnelParent, the pool is narrowed to people who were
 *    marked present in that previous campaign (the gradual funnel). */
export async function listAttendees(ev: Event, member: CurrentMember): Promise<Attendee[]> {
  const payload = await getPayloadClient();
  const scopeNode = rel(ev.geoNode);
  if (!scopeNode) return [];
  const areaDistricts =
    (ev.kind as string) === "campaign_session"
      ? await districtIdsUnder(payload, scopeNode)
      : (await myDistrictIds(member)).includes(scopeNode) ? [scopeNode] : [];
  if (!areaDistricts.length) return [];

  const funnelParentId = rel((ev as unknown as { funnelParent?: unknown }).funnelParent);
  const funnelSet = funnelParentId != null ? await presentPersonIdsInCampaign(payload, funnelParentId) : null;

  const ppl = await payload.find({
    collection: "people", overrideAccess: true, depth: 0, limit: 50000,
    where: { geoNode: { in: areaDistricts } }, sort: "name",
  });

  // Everyone marked present for THIS event.
  const present = new Set<number>();
  const at = await payload.find({
    collection: "attendance", overrideAccess: true, depth: 0, limit: 50000,
    where: { and: [{ event: { equals: ev.id } }, { present: { equals: true } }] },
  });
  for (const a of at.docs) present.add(rel((a as { person: unknown }).person) as number);

  let people = ppl.docs as Person[];
  if (funnelSet) people = people.filter((p) => funnelSet.has(p.id as number) || present.has(p.id as number));

  return people.map((p) => {
    const raw = (p as unknown as { rawGeoText?: { union?: string | null } | null }).rawGeoText;
    return {
      id: p.id as number, name: p.name ?? null, phone: p.phone, present: present.has(p.id as number),
      union: (raw?.union ?? null) || null,
      pincode: (p.pincode ?? null) || null,
    };
  });
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
