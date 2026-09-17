import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Read-only state-level role ("State functionaries") + a last-login stamp on
// people (set on real password login, never on admin impersonation).
// NOTE: the new enum value is only USED by a later seed step / runtime, never in
// this same transaction, so Postgres' "unsafe use of new enum value" rule is
// respected.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_org_assignments_role" ADD VALUE IF NOT EXISTS 'state_functionary';
  ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp(3) with time zone;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // enum values cannot be dropped in Postgres; leave the value in place.
  await db.execute(sql`
   ALTER TABLE "people" DROP COLUMN IF EXISTS "last_login_at";`)
}
