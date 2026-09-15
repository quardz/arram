import type { Payload, PayloadRequest } from "payload";

type Node = { id: number; level: string };

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

const rel = (v: unknown): number | undefined =>
  v == null ? undefined : typeof v === "object" ? (v as { id?: number }).id : (v as number);

/** Create one district session per district under a campaign_parent's scope. */
export async function fanoutCampaign(payload: Payload, parent: Record<string, unknown>, req?: PayloadRequest) {
  const scope = rel(parent.geoNode);
  if (!scope) return;
  const districtIds = await districtIdsUnder(payload, scope);
  const projectId = rel(parent.project);
  const createdBy = rel(parent.createdBy);
  for (const d of districtIds) {
    const exists = await payload.count({
      collection: "events", overrideAccess: true, req,
      where: { and: [{ parentEvent: { equals: parent.id } }, { geoNode: { equals: d } }] },
    });
    if (exists.totalDocs) continue;
    await payload.create({
      collection: "events", overrideAccess: true, req,
      data: {
        name: parent.name as string, kind: "campaign_session",
        project: projectId, geoNode: d, parentEvent: parent.id as number,
        date: (parent.date as string) ?? undefined, createdBy,
      },
    });
  }
}
