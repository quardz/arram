import type { CollectionConfig } from "payload";
import { anyone, isOrgUser } from "../access";

/** Geography tree (adjacency list) — State→Region→Mandalam→District→Union→Panchayat→Temple. */
export const GeoNodes: CollectionConfig = {
  slug: "geoNodes",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "level", "parent", "mergedInto"],
    group: "People & Org",
  },
  access: {
    read: anyone,
    create: isOrgUser,
    update: isOrgUser,
    delete: isOrgUser,
  },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    { name: "nameTamil", type: "text" },
    {
      name: "level",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "State", value: "state" },
        { label: "Region", value: "region" },
        { label: "Mandalam / Zone", value: "mandalam" },
        { label: "District", value: "district" },
        { label: "Union", value: "union" },
        { label: "Panchayat", value: "panchayat" },
        { label: "Temple", value: "temple" },
      ],
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "geoNodes",
      index: true,
      admin: { description: "Parent node (null for State). Region↔Mandalam set manually." },
    },
    { name: "code", type: "text", admin: { description: "e.g. Mandalam number" } },
    { name: "aliases", type: "array", fields: [{ name: "value", type: "text" }], admin: { description: "Spelling variants seen in imports" } },
    {
      name: "mergedInto",
      type: "relationship",
      relationTo: "geoNodes",
      admin: { description: "If set, this node was merged into the target (dedup)." },
    },
    { name: "pincodes", type: "array", fields: [{ name: "value", type: "text" }] },
  ],
};

export default GeoNodes;
