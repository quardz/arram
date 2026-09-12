import type { CollectionConfig } from "payload";

/**
 * Admin-panel users (staff). Standard email/password auth so the Payload admin
 * is usable immediately with no SMS. This is the `admin.user` collection.
 *
 * NOTE: org people log into the member-facing app via phone-OTP against the
 * `people` collection (separate concern, built in the auth module). The 62k
 * phone-only registry never needs an email because it isn't the panel login.
 */
export const Admins: CollectionConfig = {
  slug: "admins",
  auth: true,
  admin: { useAsTitle: "email", group: "System", defaultColumns: ["name", "email"] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [{ name: "name", type: "text" }],
};

export default Admins;
