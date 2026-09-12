import type { CollectionConfig } from "payload";
import { isSignedIn } from "../access";
import { SESSION_SECONDS } from "../lib/env";

/**
 * The single unified people registry. Phone (10-digit) is the unique ID for the
 * whole system. Org people are `people` rows that ALSO have an orgAssignment;
 * most people never log in.
 *
 * Auth: local (email/password) strategy is disabled — login is phone-OTP only,
 * implemented via a custom strategy + endpoints in the auth module. That keeps
 * the 62k imported people free of any email requirement.
 */
export const People: CollectionConfig = {
  slug: "people",
  auth: {
    disableLocalStrategy: true,
    tokenExpiration: SESSION_SECONDS,
    depth: 0,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "otpVerified", "geoNode"],
    group: "People & Org",
  },
  access: {
    // Only org users can reach the admin panel or read/write people.
    admin: async (args) => (await isSignedIn(args)) === true,
    read: isSignedIn,
    create: isSignedIn,
    update: isSignedIn,
    delete: isSignedIn,
  },
  fields: [
    {
      name: "phone",
      type: "text",
      required: true,
      unique: true,
      index: true,
      validate: (val: unknown) =>
        (typeof val === "string" && /^[6-9]\d{9}$/.test(val)) ||
        "Enter a valid 10-digit Indian mobile number",
    },
    { name: "name", type: "text" },
    { name: "dob", type: "date", admin: { date: { pickerAppearance: "dayOnly" } } },
    {
      name: "gender",
      type: "select",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
    },
    {
      name: "pincode",
      type: "text",
      validate: (val: unknown) =>
        !val || /^\d{6}$/.test(String(val)) || "Enter a valid 6-digit pincode",
    },
    { name: "referredBy", type: "relationship", relationTo: "people" },
    {
      name: "programId",
      type: "relationship",
      relationTo: "projects",
      admin: { description: "Which program/project they joined" },
    },
    { name: "geoNode", type: "relationship", relationTo: "geoNodes", index: true },
    { name: "otpVerified", type: "checkbox", defaultValue: false, index: true },
    {
      name: "referralCode",
      type: "text",
      unique: true,
      index: true,
      admin: { description: "Base-36 of phone, 7-char uppercase" },
    },
    {
      name: "source",
      type: "select",
      defaultValue: "signup",
      options: [
        { label: "Self signup", value: "signup" },
        { label: "Excel import", value: "excel-import" },
        { label: "Added by org", value: "org-added" },
        { label: "Event", value: "event" },
      ],
    },
    {
      name: "rawGeoText",
      type: "group",
      admin: { description: "Original import strings, for re-mapping after geo merges" },
      fields: [
        { name: "mandalam", type: "text" },
        { name: "district", type: "text" },
        { name: "union", type: "text" },
      ],
    },
  ],
};

export default People;
