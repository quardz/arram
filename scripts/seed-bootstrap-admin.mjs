// One-time bootstrap: assign a state_admin org role to a phone so login can be
// tested before other assignments exist. Runs in vercel-build. Idempotent.
import fs from 'node:fs'; import path from 'node:path'; import pg from 'pg';
function loadEnvLocal(){try{const t=fs.readFileSync(path.resolve(process.cwd(),'.env.local'),'utf8');for(const l of t.split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);if(m&&!(m[1]in process.env))process.env[m[1]]=m[2].trim().replace(/^["']|["']$/g,'');}}catch{}}
loadEnvLocal();
const url=process.env.DATABASE_URI_DIRECT||process.env.DATABASE_URI;
if(!url){console.log('bootstrap-admin: no DB url; skipping');process.exit(0);}
const phone=(process.env.BOOTSTRAP_ADMIN_PHONE||'9901357171').trim();
const c=new pg.Client({connectionString:url});
try{
  await c.connect();
  const p=await c.query('SELECT id,name FROM people WHERE phone=$1',[phone]);
  if(!p.rows.length){console.log(`bootstrap-admin: ${phone} not in people; skipping`);process.exit(0);}
  const s=await c.query("SELECT id FROM geo_nodes WHERE level='state' ORDER BY id LIMIT 1");
  if(!s.rows.length){console.log('bootstrap-admin: no state node; skipping');process.exit(0);}
  const pid=p.rows[0].id, sid=s.rows[0].id;
  const ex=await c.query('SELECT 1 FROM org_assignments WHERE person_id=$1 AND geo_node_id=$2 AND role=$3',[pid,sid,'state_admin']);
  if(ex.rows.length){console.log('bootstrap-admin: assignment already exists; skipping');process.exit(0);}
  await c.query('INSERT INTO org_assignments (person_id,geo_node_id,role,active) VALUES ($1,$2,$3,true)',[pid,sid,'state_admin']);
  console.log(`bootstrap-admin: assigned state_admin to ${p.rows[0].name} (${phone}).`);
}catch(e){console.error('bootstrap-admin: ERROR',e.message);process.exitCode=1;}finally{await c.end();}
