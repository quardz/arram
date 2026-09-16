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
