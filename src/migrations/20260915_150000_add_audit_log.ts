import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_audit_log_action" AS ENUM('login', 'logout', 'create_session', 'quickadd_person', 'impersonate_start', 'impersonate_stop');
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "enum_audit_log_action" NOT NULL,
  	"actor_id" integer NOT NULL,
  	"actor_role" varchar,
  	"impersonated_person_id" integer,
  	"event_id" integer,
  	"target_person_id" integer,
  	"detail" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_log_id" integer;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_people_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_impersonated_person_id_people_id_fk" FOREIGN KEY ("impersonated_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_target_person_id_people_id_fk" FOREIGN KEY ("target_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");
  CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_id");
  CREATE INDEX "audit_log_impersonated_person_idx" ON "audit_log" USING btree ("impersonated_person_id");
  CREATE INDEX "audit_log_event_idx" ON "audit_log" USING btree ("event_id");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "audit_log" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "audit_log" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audit_log_fk";
  DROP INDEX "payload_locked_documents_rels_audit_log_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_log_id";
  DROP TYPE "public"."enum_audit_log_action";`)
}
