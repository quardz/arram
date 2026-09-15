import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_kind" AS ENUM('local', 'campaign_parent', 'campaign_session');
  ALTER TABLE "events" ALTER COLUMN "project_id" DROP NOT NULL;
  ALTER TABLE "events" ADD COLUMN "kind" "enum_events_kind" DEFAULT 'local' NOT NULL;
  ALTER TABLE "events" ADD COLUMN "parent_event_id" integer;
  ALTER TABLE "events" ADD COLUMN "created_by_id" integer;
  ALTER TABLE "events" ADD CONSTRAINT "events_parent_event_id_events_id_fk" FOREIGN KEY ("parent_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_people_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_kind_idx" ON "events" USING btree ("kind");
  CREATE INDEX "events_parent_event_idx" ON "events" USING btree ("parent_event_id");
  CREATE INDEX "events_created_by_idx" ON "events" USING btree ("created_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP CONSTRAINT "events_parent_event_id_events_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_created_by_id_people_id_fk";
  
  DROP INDEX "events_kind_idx";
  DROP INDEX "events_parent_event_idx";
  DROP INDEX "events_created_by_idx";
  ALTER TABLE "events" ALTER COLUMN "project_id" SET NOT NULL;
  ALTER TABLE "events" DROP COLUMN "kind";
  ALTER TABLE "events" DROP COLUMN "parent_event_id";
  ALTER TABLE "events" DROP COLUMN "created_by_id";
  DROP TYPE "public"."enum_events_kind";`)
}
