import type { CollectionConfig } from "payload";
import { isSignedIn } from "../access";

/** A per-project acquisition group of people (records how they were reached). */
export const Lists: CollectionConfig = {
  slug: "lists",
  admin: { useAsTitle: "name", defaultColumns: ["name", "project", "acquisitionChannel"], group: "Projects" },
  access: { read: isSignedIn, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "project", type: "relationship", relationTo: "projects", index: true },
    {
      name: "acquisitionChannel",
      type: "select",
      options: [
        { label: "Social media", value: "social_media" },
        { label: "OTP verification", value: "otp_verification" },
        { label: "Event", value: "event" },
        { label: "Import", value: "import" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "geoScope", type: "relationship", relationTo: "geoNodes" },
  ],
};

export default Lists;
