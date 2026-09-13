import type { CollectionConfig } from "payload";
import { anyone, isSignedIn } from "../access";

/**
 * Complete Tamil Nadu village master from the Local Government Directory (LGD):
 * every village with its gram panchayat, block, taluk, district and LGD codes,
 * plus a best-effort pincode carrying a confidence level.
 */
export const GeoVillages: CollectionConfig = {
  slug: "geoVillages",
  admin: {
    useAsTitle: "village",
    defaultColumns: ["village", "block", "taluk", "district", "pincode", "pincodeMatchLevel"],
    group: "Geography",
  },
  access: {
    read: anyone,
    create: isSignedIn,
    update: isSignedIn,
    delete: isSignedIn,
  },
  fields: [
    { name: "villageCode", type: "text", required: true, unique: true, index: true, admin: { description: "LGD village code" } },
    { name: "village", type: "text", required: true, index: true },
    { name: "villageTamil", type: "text" },
    { name: "gramPanchayat", type: "text" },
    { name: "block", type: "text", index: true, admin: { description: "Panchayat union block" } },
    { name: "taluk", type: "text", index: true },
    { name: "district", type: "text", index: true },
    { name: "districtCode", type: "text" },
    { name: "talukCode", type: "text" },
    { name: "blockCode", type: "text" },
    { name: "pincode", type: "text", index: true },
    {
      name: "pincodeMatchLevel",
      type: "select",
      index: true,
      admin: { description: "Confidence of the derived pincode" },
      options: [
        { label: "High (exact post office / unique name)", value: "high" },
        { label: "Good (name match / same gram panchayat)", value: "good" },
        { label: "Medium (same block)", value: "medium" },
        { label: "Low (same taluk)", value: "low" },
      ],
    },
  ],
};

export default GeoVillages;
