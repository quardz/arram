import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_org_assignments_role" ADD VALUE IF NOT EXISTS 'super_admin';
  ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "email" varchar;
  ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "secondary_phone" varchar;
  ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "full_time" boolean DEFAULT false;
  ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "social_links" jsonb;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "people" DROP COLUMN IF EXISTS "email";
  ALTER TABLE "people" DROP COLUMN IF EXISTS "secondary_phone";
  ALTER TABLE "people" DROP COLUMN IF EXISTS "full_time";
  ALTER TABLE "people" DROP COLUMN IF EXISTS "social_links";`)
}
