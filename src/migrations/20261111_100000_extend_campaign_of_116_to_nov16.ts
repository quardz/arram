import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// One-off: extend session 116, its parent campaign and every sibling district
// session until 16 Nov 2026 (end of day IST). Runs once via payload migrate.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "events" SET "end_at" = '2026-11-16 23:59:59+05:30', "updated_at" = now()
   WHERE "id" = 116
      OR "id" = (SELECT "parent_event_id" FROM "events" WHERE "id" = 116)
      OR "parent_event_id" = (SELECT "parent_event_id" FROM "events" WHERE "id" = 116);`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Previous end dates not recorded; leave as-is.
}
