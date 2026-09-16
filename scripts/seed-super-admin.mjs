// Ensures the test/super-admin phone always has an active super_admin assignment
// at the state node. Idempotent; runs in vercel-build after migrate (so the
// 'super_admin' enum value exists). Guarantees the test user stays super_admin
// even if org edits reassign roles. Override phone via SUPER_ADMIN_PHONE.
import fs from "node:fs"; import path from "node:path"; import pg from "pg";
function loadEnvLocal(){try{const t=fs.readFileSync(path.resolve(process.cwd(),".env.local"),"utf8");for(const l of t.split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);if(m&&!(m[1]in process.env))process.env[m[1]]=m[2].trim().replace(/^["']|["']$/g,"");}}catch{}}
loadEnvLocal();
const url=process.env.DATABASE_URI_DIRECT||process.env.DATABASE_URI;
if(!url){console.log("seed-super-admin: no DB url; skipping");process.exit(0);}
const phone=(process.env.SUPER_ADMIN_PHONE||"9901357171").trim();
const c=new pg.Client({connectionString:url});
try{
  await c.connect();
  const p=await c.query("SELECT id,name FROM people WHERE phone=$1 LIMIT 1",[phone]);
  if(!p.rows.length){console.log(`seed-super-admin: ${phone} not in people; skipping`);process.exit(0);}
  const s=await c.query("SELECT id FROM geo_nodes WHERE level='state' ORDER BY id LIMIT 1");
  if(!s.rows.length){console.log("seed-super-admin: no state node; skipping");process.exit(0);}
  const pid=p.rows[0].id, sid=s.rows[0].id;
  const ex=await c.query("SELECT 1 FROM org_assignments WHERE person_id=$1 AND role='super_admin' AND active=true",[pid]);
  if(ex.rows.length){console.log("seed-super-admin: already super_admin; skipping");process.exit(0);}
  await c.query("INSERT INTO org_assignments (person_id,geo_node_id,role,active) VALUES ($1,$2,'super_admin',true)",[pid,sid]);
  console.log(`seed-super-admin: granted super_admin to ${p.rows[0].name} (${phone}).`);
}catch(e){console.error("seed-super-admin: ERROR",e.message);process.exitCode=1;}finally{await c.end();}
