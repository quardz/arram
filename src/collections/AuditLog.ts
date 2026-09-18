import type { CollectionConfig } from "payload";
import { isSignedIn } from "../access";

/**
 * Append-only audit trail of member actions. Written by the member APIs via
 * src/lib/audit.ts. `actor` is always the REAL person who acted (the admin,
 * even when impersonating); `impersonatedPerson` is set when the action was
 * taken while viewing as someone else.
 */
export const AuditLog: CollectionConfig = {
  slug: "auditLog",
  admin: {
    useAsTitle: "action",
    defaultColumns: ["action", "actor", "detail", "createdAt"],
    group: "People & Org",
  },
  access: { read: isSignedIn, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    {
      name: "action",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Login", value: "login" },
        { label: "Logout", value: "logout" },
        { label: "Create session", value: "create_session" },
        { label: "Quick-add person", value: "quickadd_person" },
        { label: "Impersonate start", value: "impersonate_start" },
        { label: "Impersonate stop", value: "impersonate_stop" },
        { label: "Delete session/campaign", value: "delete_session" },
      ],
    },
    { name: "actor", type: "relationship", relationTo: "people", required: true, index: true },
    { name: "actorRole", type: "text" },
    { name: "impersonatedPerson", type: "relationship", relationTo: "people", index: true },
    { name: "event", type: "relationship", relationTo: "events", index: true },
    { name: "targetPerson", type: "relationship", relationTo: "people" },
    { name: "detail", type: "text" },
  ],
};

export default AuditLog;
