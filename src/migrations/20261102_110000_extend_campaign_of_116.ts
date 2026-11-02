import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// One-off: reopen the whole campaign that session 116 belongs to — the parent
// campaign and every one of its district sessions — until 10 Nov 2026 (end of
// day IST). Runs once via payload migrate; no-op if 116 has no parent.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "events" SET "end_at" = '2026-11-10 23:59:59+05:30', "updated_at" = now()
   WHERE "id" = (SELECT "parent_event_id" FROM "events" WHERE "id" = 116)
      OR "parent_event_id" = (SELECT "parent_event_id" FROM "events" WHERE "id" = 116);`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Previous end dates not recorded; leave as-is.
}
