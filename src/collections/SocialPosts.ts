import type { CollectionConfig } from "payload";
import { anyone, isOrgUser } from "../access";

/**
 * Org people post image+caption scoped to their geo node (or any node below it).
 * Higher levels can flag a post for the social-media team (curatedForSocial).
 * The public feed is all published posts.
 */
export const SocialPosts: CollectionConfig = {
  slug: "socialPosts",
  admin: { useAsTitle: "caption", defaultColumns: ["caption", "author", "geoNode", "curatedForSocial", "status"], group: "Community" },
  access: {
    read: anyone, // public feed
    create: isOrgUser,
    update: isOrgUser,
    delete: isOrgUser,
  },
  fields: [
    { name: "author", type: "relationship", relationTo: "people", index: true },
    { name: "geoNode", type: "relationship", relationTo: "geoNodes", index: true, admin: { description: "Must be within the author's downward scope (enforced in module)." } },
    { name: "images", type: "relationship", relationTo: "media", hasMany: true },
    { name: "caption", type: "textarea" },
    {
      name: "status",
      type: "select",
      defaultValue: "published",
      options: [
        { label: "Published", value: "published" },
        { label: "Hidden", value: "hidden" },
      ],
      index: true,
    },
    { name: "curatedForSocial", type: "checkbox", defaultValue: false, index: true, admin: { description: "Marked by upper levels for the social-media team." } },
    { name: "curatedBy", type: "relationship", relationTo: "people" },
  ],
};

export default SocialPosts;
