// Authoritative org-structure seed (AAS) + district assignments.
// Versioned: wipes and rebuilds geoNodes + orgAssignments once per version bump,
// then no-ops. Runs in vercel-build after migrate. Reads scripts/geo/org_structure.json.
import fs from "node:fs"; import path from "node:path"; import pg from "pg";
function loadEnvLocal(){try{const t=fs.readFileSync(path.resolve(process.cwd(),".env.local"),"utf8");for(const l of t.split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);if(m&&!(m[1]in process.env))process.env[m[1]]=m[2].trim().replace(/^["']|["']$/g,"");}}catch{}}
loadEnvLocal();
const url=process.env.DATABASE_URI_DIRECT||process.env.DATABASE_URI;
if(!url){console.log("seed-org: no DB url; skipping");process.exit(0);}
// FROZEN: assignments/people are now edited in-app (DB is source of truth).
// This seed would DELETE+rebuild geo_nodes + org_assignments, wiping those edits.
// It only runs when explicitly forced. Structure will not be re-seeded.
if(process.env.ORG_SEED_FORCE!=="true"){console.log("seed-org: frozen (set ORG_SEED_FORCE=true to run)");process.exit(0);}
const data=JSON.parse(fs.readFileSync(new URL("./geo/org_structure.json",import.meta.url).pathname,"utf8"));
const VERSION=data.version;
const c=new pg.Client({connectionString:url});
async function insertBatch(table,cols,rows,extra=""){
  const B=500;let n=0;
  for(let i=0;i<rows.length;i+=B){const s=rows.slice(i,i+B);const v=[];
    const tup=s.map((r,j)=>{const b=j*cols.length;cols.forEach(cn=>v.push(r[cn]??null));return "("+cols.map((_,k)=>`$${b+k+1}`).join(",")+")";}).join(",");
    const res=await c.query(`INSERT INTO "${table}" (${cols.map(x=>`"${x}"`).join(",")}) VALUES ${tup} ${extra}`,v);n+=res.rowCount;}
  return n;
}
try{
  await c.connect();
  // version check via payload_kv
  const cur=await c.query("SELECT data FROM payload_kv WHERE key='org_seed_version'").catch(()=>({rows:[]}));
  if(cur.rows[0] && Number(cur.rows[0].data?.v)===VERSION){console.log(`seed-org: version ${VERSION} already applied; skipping.`);process.exit(0);}
  await c.query("BEGIN");
  await c.query("DELETE FROM org_assignments");
  await c.query("DELETE FROM geo_nodes");
  await insertBatch("geo_nodes",["id","name","name_tamil","level","parent_id","code"],data.nodes,'ON CONFLICT ("id") DO NOTHING');
  await c.query("SELECT setval(pg_get_serial_sequence('geo_nodes','id'),(SELECT max(id) FROM geo_nodes))");
  // ensure in-charge people exist (don't overwrite existing names)
  await insertBatch("people",["phone","name","source"],data.people.map(p=>({phone:p.phone,name:p.name,source:"org-added"})),'ON CONFLICT ("phone") DO NOTHING');
  // map phone -> id
  const phones=[...new Set(data.assignments.map(a=>a.phone))];
  const pr=await c.query(`SELECT id,phone FROM people WHERE phone = ANY($1)`,[phones]);
  const idByPhone=Object.fromEntries(pr.rows.map(r=>[r.phone,r.id]));
  const asg=data.assignments.filter(a=>idByPhone[a.phone]).map(a=>({person_id:idByPhone[a.phone],geo_node_id:a.node_id,role:a.role,active:true}));
  const ins=await insertBatch("org_assignments",["person_id","geo_node_id","role","active"],asg,"");
  await c.query(`INSERT INTO payload_kv (key,data) VALUES ('org_seed_version',$1)
                 ON CONFLICT (key) DO UPDATE SET data=EXCLUDED.data`,[JSON.stringify({v:VERSION})]);
  await c.query("COMMIT");
  console.log(`seed-org: rebuilt ${data.nodes.length} nodes, ensured ${data.people.length} people, ${ins} assignments (v${VERSION}).`);
}catch(e){await c.query("ROLLBACK").catch(()=>{});console.error("seed-org: ERROR",e.message);process.exitCode=1;}finally{await c.end();}
