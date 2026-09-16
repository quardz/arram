import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_people_source" ADD VALUE IF NOT EXISTS 'join-form';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Postgres cannot drop a value from an enum type; nothing to undo.
}
