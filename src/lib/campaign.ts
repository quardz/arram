import type { Payload, PayloadRequest } from "payload";

type Node = { id: number; level: string };

const LEVEL_ORDER = ["state", "region", "mandalam", "district", "union", "panchayat", "temple"];

/** District geoNode ids under a scope node (state/region/mandalam/district). */
export async function districtIdsUnder(payload: Payload, nodeId: number): Promise<number[]> {
  const node = (await payload
    .findByID({ collection: "geoNodes", id: nodeId, overrideAccess: true, depth: 0 })
    .catch(() => null)) as (Node | null);
  if (!node) return [];
  if (node.level === "district") return [nodeId];
  const childrenOf = async (parentIds: number[]) => {
    if (!parentIds.length) return [] as Node[];
    const r = await payload.find({
      collection: "geoNodes", overrideAccess: true, depth: 0, limit: 5000,
      where: { parent: { in: parentIds } },
    });
    return r.docs as unknown as Node[];
  };
  if (node.level === "mandalam") {
    return (await childrenOf([nodeId])).filter((d) => d.level === "district").map((d) => d.id);
  }
  if (node.level === "region") {
    const mans = await childrenOf([nodeId]);
    return (await childrenOf(mans.map((m) => m.id))).filter((d) => d.level === "district").map((d) => d.id);
  }
  // state or above → all districts
  const r = await payload.find({
    collection: "geoNodes", overrideAccess: true, depth: 0, limit: 5000,
    where: { level: { equals: "district" } },
  });
  return (r.docs as unknown as Node[]).map((d) => d.id);
}

/** geoNode ids AT a given level under a scope node (for campaign fan-out).
 *  If the scope itself is at that level, returns just the scope. */
export async function nodesAtLevelUnder(payload: Payload, scopeId: number, level: string): Promise<number[]> {
  const scope = (await payload
    .findByID({ collection: "geoNodes", id: scopeId, overrideAccess: true, depth: 0 })
    .catch(() => null)) as (Node | null);
  if (!scope) return [];
  if (scope.level === level) return [scopeId];
  const target = LEVEL_ORDER.indexOf(level);
  if (target < 0 || target <= LEVEL_ORDER.indexOf(scope.level)) {
    // level is above/equal the scope, or unknown → nothing meaningful below
    return scope.level === level ? [scopeId] : [];
  }
  const result: number[] = [];
  let frontier = [scopeId];
  // Descend level by level, collecting target-level nodes, until frontier drained.
  while (frontier.length) {
    const r = await payload.find({
      collection: "geoNodes", overrideAccess: true, depth: 0, limit: 5000,
      where: { parent: { in: frontier } },
    });
    const kids = r.docs as unknown as Node[];
    for (const k of kids) if (k.level === level) result.push(k.id);
    frontier = kids
      .filter((k) => LEVEL_ORDER.indexOf(k.level) < target)
      .map((k) => k.id);
  }
  return [...new Set(result)];
}

const rel = (v: unknown): number | undefined =>
  v == null ? undefined : typeof v === "object" ? (v as { id?: number }).id : (v as number);

/** Is this campaign event currently open for taking attendance?
 *  Local events (no window) are always open. Campaigns open within [startAt, endAt]. */
export function campaignOpen(ev: { startAt?: string | null; endAt?: string | null }): boolean {
  const now = Date.now();
  const start = ev.startAt ? new Date(ev.startAt).getTime() : null;
  const end = ev.endAt ? new Date(ev.endAt).getTime() : null;
  if (start != null && now < start) return false;
  if (end != null && now > end) return false;
  return true;
}

/** "upcoming" | "open" | "closed" for a campaign window. */
export function campaignStatus(ev: { startAt?: string | null; endAt?: string | null }): "upcoming" | "open" | "closed" {
  const now = Date.now();
  const start = ev.startAt ? new Date(ev.startAt).getTime() : null;
  const end = ev.endAt ? new Date(ev.endAt).getTime() : null;
  if (start != null && now < start) return "upcoming";
  if (end != null && now > end) return "closed";
  return "open";
}

/** Person ids marked PRESENT anywhere in a campaign (across all its district/level sessions). */
export async function presentPersonIdsInCampaign(payload: Payload, campaignParentId: number): Promise<Set<number>> {
  const sessions = await payload.find({
    collection: "events", overrideAccess: true, depth: 0, limit: 5000,
    where: { parentEvent: { equals: campaignParentId } },
  });
  const sessionIds = sessions.docs.map((s) => s.id as number);
  const ids = new Set<number>();
  if (!sessionIds.length) return ids;
  const at = await payload.find({
    collection: "attendance", overrideAccess: true, depth: 0, limit: 50000,
    where: { and: [{ event: { in: sessionIds } }, { present: { equals: true } }] },
  });
  for (const a of at.docs) {
    const pid = rel((a as { person: unknown }).person);
    if (pid != null) ids.add(pid);
  }
  return ids;
}

/** Map person id → their district geoNode id (chunked lookup). */
export async function peopleDistrictOf(payload: Payload, personIds: number[]): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  const ids = [...new Set(personIds)];
  for (let i = 0; i < ids.length; i += 300) {
    const chunk = ids.slice(i, i + 300);
    if (!chunk.length) break;
    const r = await payload.find({
      collection: "people", overrideAccess: true, depth: 0, limit: chunk.length,
      where: { id: { in: chunk } },
    });
    for (const p of r.docs) {
      const d = rel((p as { geoNode?: unknown }).geoNode);
      if (d != null) map.set(p.id as number, d);
    }
  }
  return map;
}

export type CampaignRollup = { eligible: number; checked: number; districtsTotal: number; districtsStarted: number };
export type DistrictStat = { districtId: number; name: string; sessionId: number; eligible: number; checked: number; started: boolean };

type CampaignRow = Record<string, unknown> & { id: number; startAt?: string | null; endAt?: string | null; funnelParent?: unknown };

async function areaSessions(payload: Payload, campaignId: number, areaDistrictIds: number[], depth = 0) {
  if (!areaDistrictIds.length) return [];
  const r = await payload.find({
    collection: "events", overrideAccess: true, depth, limit: 5000,
    where: { and: [{ kind: { equals: "campaign_session" } }, { parentEvent: { equals: campaignId } }, { geoNode: { in: areaDistrictIds } }] },
  });
  return r.docs;
}

/** Summary numbers for a campaign within the viewer's area (cheap; for cards). */
export async function campaignRollup(payload: Payload, campaign: CampaignRow, areaDistrictIds: number[]): Promise<CampaignRollup> {
  const sessions = await areaSessions(payload, campaign.id, areaDistrictIds);
  const sessionIds = sessions.map((s) => s.id as number);
  const districtsTotal = sessionIds.length;
  const open = campaignOpen(campaign);
  const districtsStarted = open ? districtsTotal : 0;
  let checked = 0;
  if (sessionIds.length) {
    checked = (await payload.count({
      collection: "attendance", overrideAccess: true,
      where: { and: [{ event: { in: sessionIds } }, { present: { equals: true } }] },
    })).totalDocs;
  }
  let eligible = 0;
  const funnelParentId = rel(campaign.funnelParent);
  if (funnelParentId != null) {
    const present = await presentPersonIdsInCampaign(payload, funnelParentId);
    const dmap = await peopleDistrictOf(payload, [...present]);
    const area = new Set(areaDistrictIds);
    for (const d of dmap.values()) if (area.has(d)) eligible++;
  } else if (areaDistrictIds.length) {
    eligible = (await payload.count({ collection: "people", overrideAccess: true, where: { geoNode: { in: areaDistrictIds } } })).totalDocs;
  }
  return { eligible, checked, districtsTotal, districtsStarted };
}

/** Per-district breakdown for a campaign within the viewer's area. */
export async function campaignDistrictStats(payload: Payload, campaign: CampaignRow, areaDistrictIds: number[]): Promise<DistrictStat[]> {
  const sessions = await areaSessions(payload, campaign.id, areaDistrictIds, 1);
  const open = campaignOpen(campaign);
  const sessionIds = sessions.map((s) => s.id as number);

  const checkedByEvent = new Map<number, number>();
  if (sessionIds.length) {
    const at = await payload.find({
      collection: "attendance", overrideAccess: true, depth: 0, limit: 50000,
      where: { and: [{ event: { in: sessionIds } }, { present: { equals: true } }] },
    });
    for (const a of at.docs) {
      const e = rel((a as { event?: unknown }).event);
      if (e != null) checkedByEvent.set(e, (checkedByEvent.get(e) || 0) + 1);
    }
  }

  const eligByDistrict = new Map<number, number>();
  const funnelParentId = rel(campaign.funnelParent);
  if (funnelParentId != null) {
    const present = await presentPersonIdsInCampaign(payload, funnelParentId);
    const dmap = await peopleDistrictOf(payload, [...present]);
    for (const d of dmap.values()) eligByDistrict.set(d, (eligByDistrict.get(d) || 0) + 1);
  } else {
    for (const s of sessions) {
      const d = rel((s as { geoNode?: unknown }).geoNode);
      if (d == null) continue;
      eligByDistrict.set(d, (await payload.count({ collection: "people", overrideAccess: true, where: { geoNode: { equals: d } } })).totalDocs);
    }
  }

  return sessions.map((s) => {
    const node = (s as { geoNode?: unknown }).geoNode;
    const d = rel(node) as number;
    const name = (node && typeof node === "object" ? (node as { name?: string }).name : undefined) || String(d);
    return { districtId: d, name, sessionId: s.id as number, eligible: eligByDistrict.get(d) || 0, checked: checkedByEvent.get(s.id as number) || 0, started: open };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

/** Create one session per node at the campaign's takerLevel under its scope,
 *  copying the window + funnel parent so each session is self-contained. */
export async function fanoutCampaign(payload: Payload, parent: Record<string, unknown>, req?: PayloadRequest) {
  const scope = rel(parent.geoNode);
  if (!scope) return;
  const level = (parent.takerLevel as string) || "district";
  const nodeIds = await nodesAtLevelUnder(payload, scope, level);
  const projectId = rel(parent.project);
  const createdBy = rel(parent.createdBy);
  const funnelParent = rel(parent.funnelParent);
  for (const n of nodeIds) {
    const exists = await payload.count({
      collection: "events", overrideAccess: true, req,
      where: { and: [{ parentEvent: { equals: parent.id } }, { geoNode: { equals: n } }] },
    });
    if (exists.totalDocs) continue;
    await payload.create({
      collection: "events", overrideAccess: true, req,
      data: {
        name: parent.name as string, kind: "campaign_session",
        project: projectId, geoNode: n, parentEvent: parent.id as number,
        date: (parent.startAt as string) ?? (parent.date as string) ?? undefined,
        startAt: (parent.startAt as string) ?? undefined,
        endAt: (parent.endAt as string) ?? undefined,
        takerLevel: level,
        funnelParent: funnelParent,
        createdBy,
      } as unknown as { name: string; kind: "campaign_session" },
    });
  }
}
