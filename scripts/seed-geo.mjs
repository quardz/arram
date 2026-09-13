// Seeds the geo reference tables (TN villages + pincodes) from bundled JSON.
// Runs in the Vercel build (after `payload migrate`) and locally. Idempotent:
// skips entirely if geo_villages already has rows; per-row ON CONFLICT DO NOTHING.
//   node scripts/seed-geo.mjs
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

function loadEnvLocal() {
  try {
    const txt = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
}
loadEnvLocal();
const url = process.env.DATABASE_URI_DIRECT || process.env.DATABASE_URI;
if (!url) { console.log('seed-geo: no DB url; skipping'); process.exit(0); }

const dir = new URL('./geo/', import.meta.url).pathname;
const client = new pg.Client({ connectionString: url });

async function bulk(table, cols, rows, conflict) {
  const BATCH = 1000; let n = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const vals = [];
    const tup = slice.map((r, j) => {
      const b = j * cols.length;
      cols.forEach(c => vals.push(r[c] ?? null));
      return '(' + cols.map((_, k) => `$${b + k + 1}`).join(',') + ')';
    }).join(',');
    const sql = `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES ${tup} ${conflict}`;
    const res = await client.query(sql, vals);
    n += res.rowCount;
  }
  return n;
}

try {
  await client.connect();
  const { rows: chk } = await client.query('SELECT count(*)::int AS n FROM geo_villages');
  if (chk[0].n > 0) { console.log(`seed-geo: geo_villages already has ${chk[0].n} rows; skipping.`); process.exit(0); }

  const villages = JSON.parse(fs.readFileSync(dir + 'tn_villages.json', 'utf8'));
  const pincodes = JSON.parse(fs.readFileSync(dir + 'tn_pincodes.json', 'utf8'));
  const vCols = ['village_code','village','village_tamil','gram_panchayat','block','taluk','district','district_code','taluk_code','block_code','pincode','pincode_match_level'];
  const pCols = ['pincode','office','office_type','delivery','taluk','district'];
  const vN = await bulk('geo_villages', vCols, villages, 'ON CONFLICT ("village_code") DO NOTHING');
  const pN = await bulk('geo_pincodes', pCols, pincodes, '');
  console.log(`seed-geo: inserted ${vN} villages, ${pN} pincodes.`);
} catch (e) {
  console.error('seed-geo: ERROR', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
