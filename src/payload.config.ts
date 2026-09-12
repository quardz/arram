import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { env, flags, DB_CONNECTION_STRING } from "./lib/env";

import { People } from "./collections/People";
import { PersonLabels } from "./collections/PersonLabels";
import { GeoNodes } from "./collections/GeoNodes";
import { OrgAssignments } from "./collections/OrgAssignments";
import { Projects } from "./collections/Projects";
import { ProjectStages } from "./collections/ProjectStages";
import { Events } from "./collections/Events";
import { Lists } from "./collections/Lists";
import { ListMembers } from "./collections/ListMembers";
import { Attendance } from "./collections/Attendance";
import { SocialPosts } from "./collections/SocialPosts";
import { Skills } from "./collections/Skills";
import { SkillClaims } from "./collections/SkillClaims";
import { Media } from "./collections/Media";
import { OtpRequests } from "./collections/OtpRequests";
import { News } from "./collections/News";
import { Activities } from "./collections/Activities";
import { GalleryAlbums } from "./collections/GalleryAlbums";
import { Pages } from "./collections/Pages";
import { SiteSettings } from "./globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// R2 media storage — only added when fully configured; otherwise Payload falls
// back to local-disk uploads so media still works in dev.
const plugins = flags.hasR2
  ? [
      s3Storage({
        collections: { media: true },
        bucket: env.R2_BUCKET,
        config: {
          endpoint: env.R2_ENDPOINT,
          region: "auto",
          forcePathStyle: true,
          credentials: {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
          },
        },
        ...(env.R2_PUBLIC_URL
          ? {
              generateFileURL: ({ filename }: { filename: string }) =>
                `${env.R2_PUBLIC_URL}/${filename}`,
            }
          : {}),
      }),
    ]
  : [];

export default buildConfig({
  serverURL: env.SERVER_URL,
  // Fallback secret keeps the config constructible for build / codegen even with
  // no env set. Payload is never actually initialized unless flags.payloadEnabled.
  secret: env.PAYLOAD_SECRET || "DEV_ONLY_UNSET_SECRET_change_me",
  admin: {
    user: People.slug,
    meta: {
      titleSuffix: "· ARRAM",
    },
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: DB_CONNECTION_STRING || undefined },
  }),
  collections: [
    People,
    PersonLabels,
    GeoNodes,
    OrgAssignments,
    Projects,
    ProjectStages,
    Events,
    Lists,
    ListMembers,
    Attendance,
    SocialPosts,
    Skills,
    SkillClaims,
    Media,
    OtpRequests,
    News,
    Activities,
    GalleryAlbums,
    Pages,
  ],
  globals: [SiteSettings],
  plugins,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
