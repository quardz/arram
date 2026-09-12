import type { CollectionConfig } from "payload";
import { anyone, isOrgUser } from "../access";

/** Ordered funnel stages within a project. */
export const ProjectStages: CollectionConfig = {
  slug: "projectStages",
  admin: { useAsTitle: "name", defaultColumns: ["project", "order", "name"], group: "Projects" },
  access: { read: anyone, create: isOrgUser, update: isOrgUser, delete: isOrgUser },
  fields: [
    { name: "project", type: "relationship", relationTo: "projects", required: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "order", type: "number", required: true, defaultValue: 1 },
    { name: "description", type: "textarea" },
  ],
};

export default ProjectStages;
