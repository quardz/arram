import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "start_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "end_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "taker_level" varchar;
  ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "funnel_parent_id" integer;
  DO $$ BEGIN
    ALTER TABLE "events" ADD CONSTRAINT "events_funnel_parent_id_events_id_fk" FOREIGN KEY ("funnel_parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "events_funnel_parent_idx" ON "events" USING btree ("funnel_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_funnel_parent_id_events_id_fk";
  DROP INDEX IF EXISTS "events_funnel_parent_idx";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "start_at";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "end_at";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "taker_level";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "funnel_parent_id";`)
}
