import type { CollectionConfig } from "payload";
import { anyone, isSignedIn } from "../access";

/** Editable, versioned copy of news items (mirror of src/content/news.ts). */
export const News: CollectionConfig = {
  slug: "news",
  admin: { useAsTitle: "title", defaultColumns: ["title", "date", "_status"], group: "Content" },
  versions: { drafts: true },
  access: { read: anyone, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "date", type: "date" },
    { name: "excerpt", type: "textarea" },
    { name: "body", type: "richText" },
    { name: "image", type: "text", admin: { description: "Path under /public or an uploaded media URL" } },
    { name: "coverImage", type: "relationship", relationTo: "media" },
  ],
};

export default News;
