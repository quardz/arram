import type { CollectionConfig } from "payload";
import { isSignedIn } from "../access";

export const ListMembers: CollectionConfig = {
  slug: "listMembers",
  admin: { useAsTitle: "id", defaultColumns: ["list", "person", "enteredAtStage", "status"], group: "Projects" },
  access: { read: isSignedIn, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "list", type: "relationship", relationTo: "lists", required: true, index: true },
    { name: "person", type: "relationship", relationTo: "people", required: true, index: true },
    { name: "enteredAtStage", type: "relationship", relationTo: "projectStages" },
    {
      name: "status",
      type: "select",
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Dropped", value: "dropped" },
        { label: "Converted", value: "converted" },
      ],
    },
  ],
};

export default ListMembers;
