import type { CollectionConfig } from "payload";
import { anyone, isSignedIn } from "../access";

/** A project = a group of events across time/geography/stages (e.g. "Pongal 2026"). */
export const Projects: CollectionConfig = {
  slug: "projects",
  admin: { useAsTitle: "name", defaultColumns: ["name", "status", "startDate", "endDate"], group: "Projects" },
  versions: { drafts: true },
  access: { read: anyone, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", unique: true, index: true },
    { name: "description", type: "richText" },
    { name: "startDate", type: "date" },
    { name: "endDate", type: "date" },
    {
      name: "status",
      type: "select",
      defaultValue: "planned",
      options: [
        { label: "Planned", value: "planned" },
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Archived", value: "archived" },
      ],
    },
  ],
};

export default Projects;
