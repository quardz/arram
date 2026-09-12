import type { GlobalConfig } from "payload";
import { anyone, isSignedIn } from "../access";

/** Editable copy of site config (mirror of src/content/site.ts). */
export const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  admin: { group: "Content" },
  access: { read: anyone, update: isSignedIn },
  fields: [
    { name: "name", type: "text" },
    { name: "shortName", type: "text" },
    { name: "tagline", type: "textarea" },
    { name: "donateUrl", type: "text" },
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "address", type: "textarea" },
        { name: "phone", type: "text" },
        { name: "phoneHref", type: "text" },
        { name: "email", type: "text" },
      ],
    },
    {
      name: "stats",
      type: "array",
      fields: [
        { name: "value", type: "text" },
        { name: "label", type: "text" },
      ],
    },
  ],
};

export default SiteSettings;
