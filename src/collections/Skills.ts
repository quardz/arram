import type { CollectionConfig } from "payload";
import { anyone, isOrgUser } from "../access";

/** Skill marketplace — org people offer skills + free time (v1: org people only). */
export const Skills: CollectionConfig = {
  slug: "skills",
  admin: { useAsTitle: "title", defaultColumns: ["title", "person", "status"], group: "Community" },
  access: { read: anyone, create: isOrgUser, update: isOrgUser, delete: isOrgUser },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "person", type: "relationship", relationTo: "people", required: true, index: true },
    { name: "tags", type: "array", fields: [{ name: "value", type: "text" }] },
    { name: "description", type: "textarea" },
    { name: "availability", type: "text", admin: { description: "Free-time / availability" } },
    {
      name: "status",
      type: "select",
      defaultValue: "open",
      options: [
        { label: "Open", value: "open" },
        { label: "Claimed", value: "claimed" },
        { label: "Closed", value: "closed" },
      ],
      index: true,
    },
  ],
};

export default Skills;
