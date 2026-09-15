// Resolves each person's AAS district (people.geo_node_id) from their own
// mandalam+district text (pincode fallback). Version-gated; runs once per bump.
import fs from "node:fs"; import path from "node:path"; import pg from "pg";
function loadEnvLocal(){try{const t=fs.readFileSync(path.resolve(process.cwd(),".env.local"),"utf8");for(const l of t.split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);if(m&&!(m[1]in process.env))process.env[m[1]]=m[2].trim().replace(/^["']|["']$/g,"");}}catch{}}
loadEnvLocal();
const url=process.env.DATABASE_URI_DIRECT||process.env.DATABASE_URI;
if(!url){console.log("seed-person-geo: no DB url; skipping");process.exit(0);}
const VERSION=2;
const rows=JSON.parse(fs.readFileSync(new URL("./geo/person_geo.json",import.meta.url).pathname,"utf8"));
const c=new pg.Client({connectionString:url});
try{
  await c.connect();
  const cur=await c.query("SELECT data FROM payload_kv WHERE key='person_geo_version'").catch(()=>({rows:[]}));
  if(cur.rows[0] && Number(cur.rows[0].data?.v)===VERSION){console.log(`seed-person-geo: v${VERSION} applied; skipping.`);process.exit(0);}
  const B=1000; let updated=0;
  for(let i=0;i<rows.length;i+=B){
    const s=rows.slice(i,i+B); const vals=[];
    const tup=s.map((r,j)=>{const b=j*2; vals.push(r.phone, r.d); return `($${b+1},$${b+2}::int)`;}).join(",");
    const res=await c.query(
      `UPDATE "people" p SET geo_node_id=v.d FROM (VALUES ${tup}) AS v(phone,d) WHERE p.phone=v.phone`, vals);
    updated+=res.rowCount;
  }
  await c.query(`INSERT INTO payload_kv (key,data) VALUES ('person_geo_version',$1) ON CONFLICT (key) DO UPDATE SET data=EXCLUDED.data`,[JSON.stringify({v:VERSION})]);
  console.log(`seed-person-geo: set geo_node_id on ${updated} people (v${VERSION}).`);
}catch(e){console.error("seed-person-geo: ERROR",e.message);process.exitCode=1;}finally{await c.end();}
