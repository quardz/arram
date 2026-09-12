import type { CollectionConfig } from "payload";
import { isOrgUser } from "../access";

export const SkillClaims: CollectionConfig = {
  slug: "skillClaims",
  admin: { useAsTitle: "id", defaultColumns: ["skill", "claimedBy", "status"], group: "Community" },
  access: { read: isOrgUser, create: isOrgUser, update: isOrgUser, delete: isOrgUser },
  fields: [
    { name: "skill", type: "relationship", relationTo: "skills", required: true, index: true },
    { name: "claimedBy", type: "relationship", relationTo: "people", required: true },
    { name: "note", type: "textarea" },
    {
      name: "status",
      type: "select",
      defaultValue: "requested",
      options: [
        { label: "Requested", value: "requested" },
        { label: "Accepted", value: "accepted" },
        { label: "Declined", value: "declined" },
        { label: "Done", value: "done" },
      ],
    },
  ],
};

export default SkillClaims;
