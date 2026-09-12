import type { CollectionConfig } from "payload";
import { isSignedIn } from "../access";

/** Per-event attendance — the source of truth for funnel progression. */
export const Attendance: CollectionConfig = {
  slug: "attendance",
  admin: { useAsTitle: "id", defaultColumns: ["event", "person", "present", "recordedBy"], group: "Projects" },
  access: { read: isSignedIn, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "event", type: "relationship", relationTo: "events", required: true, index: true },
    { name: "person", type: "relationship", relationTo: "people", required: true, index: true },
    { name: "present", type: "checkbox", defaultValue: true, index: true },
    { name: "recordedBy", type: "relationship", relationTo: "people" },
    { name: "recordedAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
  ],
};

export default Attendance;
