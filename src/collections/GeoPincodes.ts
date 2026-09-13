import type { CollectionConfig } from "payload";
import { anyone, isSignedIn } from "../access";

/**
 * India Post pincode directory for Tamil Nadu (reference data).
 * Authoritative pincode -> post office / taluk / district lookup.
 */
export const GeoPincodes: CollectionConfig = {
  slug: "geoPincodes",
  admin: {
    useAsTitle: "office",
    defaultColumns: ["pincode", "office", "taluk", "district", "officeType"],
    group: "Geography",
  },
  access: {
    read: anyone,
    create: isSignedIn,
    update: isSignedIn,
    delete: isSignedIn,
  },
  fields: [
    { name: "pincode", type: "text", required: true, index: true },
    { name: "office", type: "text", required: true },
    { name: "officeType", type: "text", admin: { description: "H.O / S.O / B.O" } },
    { name: "delivery", type: "text" },
    { name: "taluk", type: "text", index: true },
    { name: "district", type: "text", index: true },
  ],
};

export default GeoPincodes;
