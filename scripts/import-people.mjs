// One-time importer for the ASM people list.
// Usage:  node --env-file=.env.local scripts/import-people.mjs [path/to/people_import.json]
// Reads DATABASE_URI_DIRECT (preferred) or DATABASE_URI. Idempotent: ON CONFLICT (phone) DO NOTHING.
import fs from 'node:fs';
import pg from 'pg';

const url = process.env.DATABASE_URI_DIRECT || process.env.DATABASE_URI;
if (!url) { console.error('Missing DATABASE_URI_DIRECT / DATABASE_URI'); process.exit(1); }
const file = process.argv[2] || new URL('./people_import.json', import.meta.url).pathname;
const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
console.log(`Loaded ${rows.length} records from ${file}`);

const client = new pg.Client({ connectionString: url });
await client.connect();

const cols = ['phone','name','alt_names','pincode','source','otp_verified',
              'raw_geo_text_mandalam','raw_geo_text_district','raw_geo_text_union'];
const BATCH = 1000;
let inserted = 0;
try {
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const values = [];
    const tuples = slice.map((r, j) => {
      const b = j * cols.length;
      values.push(r.phone, r.name, r.alt_names, r.pincode, 'excel-import', false,
                  r.mandalam, r.district, r.union);
      return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9})`;
    }).join(',');
    const sql = `INSERT INTO "people" (${cols.map(c=>`"${c}"`).join(',')}) VALUES ${tuples} ON CONFLICT ("phone") DO NOTHING`;
    const res = await client.query(sql, values);
    inserted += res.rowCount;
    process.stdout.write(`\r  inserted ${inserted} / ${Math.min(i+BATCH,rows.length)} processed`);
  }
  console.log(`\nDone. Inserted ${inserted} new rows (existing phones skipped).`);
} finally {
  await client.end();
}
