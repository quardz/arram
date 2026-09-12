import type { CollectionConfig } from "payload";
import { anyone, isOrgUser } from "../access";

/** Editable copy of gallery albums (mirror of src/content/gallery.ts). */
export const GalleryAlbums: CollectionConfig = {
  slug: "galleryAlbums",
  admin: { useAsTitle: "title", defaultColumns: ["title", "groupTitle", "order"], group: "Content" },
  access: { read: anyone, create: isOrgUser, update: isOrgUser, delete: isOrgUser },
  fields: [
    { name: "groupTitle", type: "text", admin: { description: "Album group heading" } },
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, index: true },
    { name: "images", type: "array", fields: [{ name: "path", type: "text" }], admin: { description: "First image is the cover" } },
    { name: "order", type: "number", defaultValue: 1 },
  ],
};

export default GalleryAlbums;
