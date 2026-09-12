// One-time importer for the ASM people list (specs/FulllistwithNames.xlsx -> people table).
//
//   Run from the project root:   node scripts/import-people.mjs
//
// Reads DATABASE_URI_DIRECT (preferred) or DATABASE_URI. If neither is in the
// environment, it loads them from .env.local in the project root.
// Idempotent: existing phone numbers are skipped (ON CONFLICT (phone) DO NOTHING),
// so it is safe to re-run.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

function loadEnvLocal() {
  try {
    const txt = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      let v = m[2].trim().replace(/^["']|["']$/g, '');
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
  } catch { /* no .env.local; rely on real env */ }
}
loadEnvLocal();

const url = process.env.DATABASE_URI_DIRECT || process.env.DATABASE_URI;
if (!url) { console.error('ERROR: DATABASE_URI_DIRECT / DATABASE_URI not set (and not found in .env.local)'); process.exit(1); }

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
    process.stdout.write(`\r  processed ${Math.min(i+BATCH,rows.length)} / ${rows.length}, inserted ${inserted}`);
  }
  console.log(`\nDone. Inserted ${inserted} new people (existing phone numbers were skipped).`);
} finally {
  await client.end();
}
