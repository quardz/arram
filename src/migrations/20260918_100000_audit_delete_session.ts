import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Allow the 'delete_session' audit action (state admin deleting a campaign/local).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_audit_log_action" ADD VALUE IF NOT EXISTS 'delete_session';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // enum values cannot be dropped in Postgres; no-op.
}
