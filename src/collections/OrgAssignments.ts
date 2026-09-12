import type { CollectionConfig } from "payload";
import { isOrgUser, isSignedIn } from "../access";

/**
 * Links a person to a geo node with a role. This is what makes someone "org staff":
 * it grants login + subtree visibility + the right to add people one level below.
 *
 * Schema is many-to-many (a person may occupy multiple nodes). The UI enforces
 * one person per node by default; the ALLOW_MULTIPLE_PER_NODE env flag relaxes it.
 */
export const OrgAssignments: CollectionConfig = {
  slug: "orgAssignments",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["person", "role", "geoNode", "active"],
    group: "People & Org",
  },
  access: {
    read: isSignedIn,
    create: isOrgUser,
    update: isOrgUser,
    delete: isOrgUser,
  },
  fields: [
    { name: "person", type: "relationship", relationTo: "people", required: true, index: true },
    { name: "geoNode", type: "relationship", relationTo: "geoNodes", required: true, index: true },
    {
      name: "role",
      type: "select",
      required: true,
      options: [
        { label: "State admin", value: "state_admin" },
        { label: "Regional organiser", value: "regional_organiser" },
        { label: "Zonal organiser", value: "zonal_organiser" },
        { label: "District organiser", value: "district_organiser" },
        { label: "Union coordinator", value: "union_coordinator" },
        { label: "Panchayat coordinator", value: "panchayat_coordinator" },
        { label: "Temple coordinator", value: "temple_coordinator" },
      ],
    },
    { name: "active", type: "checkbox", defaultValue: true, index: true },
    { name: "assignedBy", type: "relationship", relationTo: "people" },
  ],
};

export default OrgAssignments;
