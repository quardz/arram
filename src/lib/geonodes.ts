import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { GeoNode } from "@/payload-types";

export type GeoNodeLite = { id: number; name: string; nameTamil: string | null; level: string; parentId: number | null };

const rel = (v: unknown): number | null =>
  v == null ? null : typeof v === "object" ? ((v as { id?: number }).id ?? null) : (v as number);

// The geo tree (state→…→district) rarely changes (seed-org is frozen), so cache
// it across requests. This removes the "load all geoNodes" query from every org
// / campaign page render. Read-only — no data is altered; bump revalidate or the
// cache tag if the structure is ever re-seeded.
export const getGeoNodesLite = unstable_cache(
  async (): Promise<GeoNodeLite[]> => {
    const payload = await getPayloadClient();
    const r = await payload.find({ collection: "geoNodes", overrideAccess: true, depth: 0, limit: 5000, sort: "name" });
    return (r.docs as GeoNode[]).map((n) => ({
      id: n.id as number, name: n.name, nameTamil: n.nameTamil ?? null,
      level: (n.level as string) ?? "", parentId: rel(n.parent),
    }));
  },
  ["geo-nodes-lite"],
  { revalidate: 3600, tags: ["geo-nodes"] },
);
