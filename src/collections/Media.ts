import type { CollectionConfig } from "payload";
import { anyone, isOrgUser } from "../access";

/**
 * Upload collection. When R2 is configured the storage plugin (in payload.config)
 * points uploads at R2; otherwise Payload falls back to local disk so media still
 * works in dev without R2 credentials.
 */
export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 900 },
      { name: "feed", width: 1200 },
    ],
  },
  admin: { group: "Content" },
  access: { read: anyone, create: isOrgUser, update: isOrgUser, delete: isOrgUser },
  fields: [{ name: "alt", type: "text" }],
};

export default Media;
