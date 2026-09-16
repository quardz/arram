import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "otp_requests" ADD COLUMN IF NOT EXISTS "code" varchar;
  ALTER TABLE "otp_requests" ADD COLUMN IF NOT EXISTS "provider" varchar;
  ALTER TABLE "otp_requests" ADD COLUMN IF NOT EXISTS "status" varchar;
  ALTER TABLE "otp_requests" ADD COLUMN IF NOT EXISTS "message" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "otp_requests" DROP COLUMN IF EXISTS "code";
  ALTER TABLE "otp_requests" DROP COLUMN IF EXISTS "provider";
  ALTER TABLE "otp_requests" DROP COLUMN IF EXISTS "status";
  ALTER TABLE "otp_requests" DROP COLUMN IF EXISTS "message";`)
}
