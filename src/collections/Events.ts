import type { CollectionConfig } from "payload";
import { anyone, isSignedIn } from "../access";
import { fanoutCampaign } from "../lib/campaign";

/**
 * Attendance session / event. Three kinds:
 *  - local           : created by a district organiser for their own meeting.
 *  - campaign_parent : created by an admin for a project; fans out to districts.
 *  - campaign_session: auto-created per district under a campaign_parent.
 */
export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "kind", "geoNode", "date", "project"],
    group: "Projects",
  },
  access: { read: anyone, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "local",
      index: true,
      options: [
        { label: "Local (organiser meeting)", value: "local" },
        { label: "Campaign (fans out to districts)", value: "campaign_parent" },
        { label: "Campaign — district session", value: "campaign_session" },
      ],
    },
    { name: "project", type: "relationship", relationTo: "projects", index: true },
    { name: "stage", type: "relationship", relationTo: "projectStages", index: true },
    {
      name: "geoNode",
      type: "relationship",
      relationTo: "geoNodes",
      index: true,
      admin: { description: "For local/district sessions: the district. For a campaign: the scope (state/region/mandalam/district) to fan out across." },
    },
    { name: "parentEvent", type: "relationship", relationTo: "events", index: true, admin: { description: "The campaign this district session belongs to." } },
    { name: "date", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "createdBy", type: "relationship", relationTo: "people" },
    { name: "organisers", type: "relationship", relationTo: "people", hasMany: true, admin: { description: "District reps running this event" } },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === "create" && doc.kind === "campaign_parent") {
          try {
            await fanoutCampaign(req.payload, doc, req);
          } catch (e) {
            req.payload.logger.error(`campaign fanout failed: ${(e as Error).message}`);
          }
        }
        return doc;
      },
    ],
  },
};

export default Events;
