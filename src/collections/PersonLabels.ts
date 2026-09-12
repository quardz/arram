import type { CollectionConfig } from "payload";
import { isSignedIn } from "../access";

/** Extensible key/value profile data about a person (the "people_label" idea). */
export const PersonLabels: CollectionConfig = {
  slug: "personLabels",
  admin: { useAsTitle: "key", defaultColumns: ["person", "key", "value"], group: "People & Org" },
  access: { read: isSignedIn, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "person", type: "relationship", relationTo: "people", required: true, index: true },
    { name: "key", type: "text", required: true },
    { name: "value", type: "text" },
    { name: "setBy", type: "relationship", relationTo: "people" },
  ],
};

export default PersonLabels;
