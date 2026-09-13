import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_geo_villages_pincode_match_level" AS ENUM('high', 'good', 'medium', 'low');
  CREATE TABLE "geo_villages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"village_code" varchar NOT NULL,
  	"village" varchar NOT NULL,
  	"village_tamil" varchar,
  	"gram_panchayat" varchar,
  	"block" varchar,
  	"taluk" varchar,
  	"district" varchar,
  	"district_code" varchar,
  	"taluk_code" varchar,
  	"block_code" varchar,
  	"pincode" varchar,
  	"pincode_match_level" "enum_geo_villages_pincode_match_level",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "geo_pincodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pincode" varchar NOT NULL,
  	"office" varchar NOT NULL,
  	"office_type" varchar,
  	"delivery" varchar,
  	"taluk" varchar,
  	"district" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "geo_villages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "geo_pincodes_id" integer;
  CREATE UNIQUE INDEX "geo_villages_village_code_idx" ON "geo_villages" USING btree ("village_code");
  CREATE INDEX "geo_villages_village_idx" ON "geo_villages" USING btree ("village");
  CREATE INDEX "geo_villages_block_idx" ON "geo_villages" USING btree ("block");
  CREATE INDEX "geo_villages_taluk_idx" ON "geo_villages" USING btree ("taluk");
  CREATE INDEX "geo_villages_district_idx" ON "geo_villages" USING btree ("district");
  CREATE INDEX "geo_villages_pincode_idx" ON "geo_villages" USING btree ("pincode");
  CREATE INDEX "geo_villages_pincode_match_level_idx" ON "geo_villages" USING btree ("pincode_match_level");
  CREATE INDEX "geo_villages_updated_at_idx" ON "geo_villages" USING btree ("updated_at");
  CREATE INDEX "geo_villages_created_at_idx" ON "geo_villages" USING btree ("created_at");
  CREATE INDEX "geo_pincodes_pincode_idx" ON "geo_pincodes" USING btree ("pincode");
  CREATE INDEX "geo_pincodes_taluk_idx" ON "geo_pincodes" USING btree ("taluk");
  CREATE INDEX "geo_pincodes_district_idx" ON "geo_pincodes" USING btree ("district");
  CREATE INDEX "geo_pincodes_updated_at_idx" ON "geo_pincodes" USING btree ("updated_at");
  CREATE INDEX "geo_pincodes_created_at_idx" ON "geo_pincodes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_geo_villages_fk" FOREIGN KEY ("geo_villages_id") REFERENCES "public"."geo_villages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_geo_pincodes_fk" FOREIGN KEY ("geo_pincodes_id") REFERENCES "public"."geo_pincodes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_geo_villages_id_idx" ON "payload_locked_documents_rels" USING btree ("geo_villages_id");
  CREATE INDEX "payload_locked_documents_rels_geo_pincodes_id_idx" ON "payload_locked_documents_rels" USING btree ("geo_pincodes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "geo_villages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "geo_pincodes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "geo_villages" CASCADE;
  DROP TABLE "geo_pincodes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_geo_villages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_geo_pincodes_fk";
  
  DROP INDEX "payload_locked_documents_rels_geo_villages_id_idx";
  DROP INDEX "payload_locked_documents_rels_geo_pincodes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "geo_villages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "geo_pincodes_id";
  DROP TYPE "public"."enum_geo_villages_pincode_match_level";`)
}
