import type { CollectionConfig } from "payload";
import { anyone, isOrgUser } from "../access";

/** Editable copy of the activity cards (mirror of src/content/activities.ts). */
export const Activities: CollectionConfig = {
  slug: "activities",
  admin: { useAsTitle: "title", defaultColumns: ["title", "href", "order"], group: "Content" },
  access: { read: anyone, create: isOrgUser, update: isOrgUser, delete: isOrgUser },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "href", type: "text" },
    { name: "image", type: "text" },
    { name: "blurb", type: "textarea" },
    { name: "order", type: "number", defaultValue: 1 },
  ],
};

export default Activities;
