import type { CollectionConfig } from "payload";
import { anyone, isSignedIn } from "../access";

/** Generic editable pages/blocks of copy, keyed by slug (optional layer over static pages). */
export const Pages: CollectionConfig = {
  slug: "pages",
  admin: { useAsTitle: "title", defaultColumns: ["title", "slug", "_status"], group: "Content" },
  versions: { drafts: true },
  access: { read: anyone, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "body", type: "richText" },
  ],
};

export default Pages;
