import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// One-off: reopen attendance session 116 — closing date moved to 10 Nov 2026
// (end of day IST). Runs once via payload migrate; no-op if the row is absent.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "events" SET "end_at" = '2026-11-10 23:59:59+05:30', "updated_at" = now() WHERE "id" = 116;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Previous end date not recorded; leave as-is.
}
