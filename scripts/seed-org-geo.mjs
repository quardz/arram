// Seeds the org geography tree (geoNodes) from bundled JSON. Runs in vercel-build
// after migrate. Idempotent: skips if geo_nodes already has rows.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
function loadEnvLocal(){try{const t=fs.readFileSync(path.resolve(process.cwd(),'.env.local'),'utf8');for(const l of t.split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);if(m&&!(m[1]in process.env))process.env[m[1]]=m[2].trim().replace(/^["']|["']$/g,'');}}catch{}}
loadEnvLocal();
const url=process.env.DATABASE_URI_DIRECT||process.env.DATABASE_URI;
if(!url){console.log('seed-org-geo: no DB url; skipping');process.exit(0);}
const nodes=JSON.parse(fs.readFileSync(new URL('./geo/org_geonodes.json',import.meta.url).pathname,'utf8'));
const client=new pg.Client({connectionString:url});
try{
  await client.connect();
  const {rows}=await client.query('SELECT count(*)::int n FROM geo_nodes');
  if(rows[0].n>0){console.log(`seed-org-geo: geo_nodes already has ${rows[0].n} rows; skipping.`);process.exit(0);}
  const cols=['id','name','name_tamil','level','parent_id','code'];
  const BATCH=500;let ins=0;
  for(let i=0;i<nodes.length;i+=BATCH){
    const s=nodes.slice(i,i+BATCH);const vals=[];
    const tup=s.map((r,j)=>{const b=j*cols.length;cols.forEach(c=>vals.push(r[c]??null));return '('+cols.map((_,k)=>`$${b+k+1}`).join(',')+')';}).join(',');
    const res=await client.query(`INSERT INTO "geo_nodes" (${cols.map(c=>`"${c}"`).join(',')}) VALUES ${tup} ON CONFLICT ("id") DO NOTHING`,vals);
    ins+=res.rowCount;
  }
  await client.query(`SELECT setval(pg_get_serial_sequence('geo_nodes','id'), (SELECT max(id) FROM geo_nodes))`);
  console.log(`seed-org-geo: inserted ${ins} geo nodes.`);
}catch(e){console.error('seed-org-geo: ERROR',e.message);process.exitCode=1;}finally{await client.end();}
