import type { CollectionConfig } from "payload";
import { anyone, isSignedIn } from "../access";

/** A project instance at a place/time, tied to a stage (e.g. "Pongal 2026 – Coimbatore"). */
export const Events: CollectionConfig = {
  slug: "events",
  admin: { useAsTitle: "name", defaultColumns: ["name", "project", "stage", "geoNode", "date"], group: "Projects" },
  access: { read: anyone, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "project", type: "relationship", relationTo: "projects", required: true, index: true },
    { name: "stage", type: "relationship", relationTo: "projectStages", index: true },
    { name: "geoNode", type: "relationship", relationTo: "geoNodes", index: true },
    { name: "date", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "organisers", type: "relationship", relationTo: "people", hasMany: true, admin: { description: "District reps running this event" } },
  ],
};

export default Events;
