import pincodeMap from "@/lib/pincode_aas_map.json";

/**
 * Runtime pincode → AAS district geoNode id.
 * Backed by scripts/geo/pincode_aas_map.json (the same map used to place the
 * imported people). geoNode ids are stable because seed-org is frozen.
 */
const idx = new Map<string, number>();
for (const r of pincodeMap as { pincode: string; d: number }[]) idx.set(r.pincode, r.d);

export function pincodeToGeoNode(pincode: string): number | undefined {
  const pc = (pincode || "").replace(/\D/g, "").slice(0, 6);
  return pc.length === 6 ? idx.get(pc) : undefined;
}
