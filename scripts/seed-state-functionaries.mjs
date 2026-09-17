// Seeds the read-only "State functionaries" — people + an active
// state_functionary assignment at the state node. Idempotent; runs in
// vercel-build AFTER migrate (so the 'state_functionary' enum value exists).
// Phones are sanitized to 10 digits (strip non-digits + leading 91/0).
import fs from "node:fs"; import path from "node:path"; import pg from "pg";
function loadEnvLocal(){try{const t=fs.readFileSync(path.resolve(process.cwd(),".env.local"),"utf8");for(const l of t.split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);if(m&&!(m[1]in process.env))process.env[m[1]]=m[2].trim().replace(/^["']|["']$/g,"");}}catch{}}
loadEnvLocal();

const norm = (raw) => String(raw||"").replace(/\D/g,"").replace(/^91(\d{10})$/,"$1").replace(/^0(\d{10})$/,"$1");
const referral = (phone) => { const n = parseInt(phone,10); return Number.isFinite(n) ? n.toString(36).toUpperCase().padStart(7,"0") : null; };

const PEOPLE = [
  { name: "Manikandan",   phone: "944-556-0803" },
  { name: "Padma",        phone: "+917358064179" },
  { name: "Rajagopal",    phone: "+917358064178" },
  { name: "Venkat",       phone: "994-003-6215" },
  { name: "Vivekanandan", phone: "+919500997395" },
  { name: "Balasundaram", phone: "+91 87540 76682" },
].map((p) => ({ name: p.name, phone: norm(p.phone) }));

const url = process.env.DATABASE_URI_DIRECT || process.env.DATABASE_URI;
if(!url){console.log("seed-state-functionaries: no DB url; skipping");process.exit(0);}
const c = new pg.Client({connectionString:url});
try{
  await c.connect();
  const s = await c.query("SELECT id FROM geo_nodes WHERE level='state' ORDER BY id LIMIT 1");
  if(!s.rows.length){console.log("seed-state-functionaries: no state node; skipping");process.exit(0);}
  const sid = s.rows[0].id;
  let created=0, linked=0, skipped=0;
  for(const p of PEOPLE){
    if(!/^[6-9]\d{9}$/.test(p.phone)){console.log(`seed-state-functionaries: bad phone for ${p.name} (${p.phone}); skipping`);continue;}
    let r = await c.query("SELECT id,name FROM people WHERE phone=$1 LIMIT 1",[p.phone]);
    let pid;
    if(r.rows.length){
      pid = r.rows[0].id;
      if(!r.rows[0].name) await c.query("UPDATE people SET name=$2 WHERE id=$1",[pid,p.name]);
    } else {
      const ins = await c.query(
        "INSERT INTO people (phone,name,source,otp_verified,referral_code) VALUES ($1,$2,'org-added',false,$3) ON CONFLICT (phone) DO NOTHING RETURNING id",
        [p.phone, p.name, referral(p.phone)]
      );
      if(ins.rows.length){ pid = ins.rows[0].id; created++; }
      else { const again = await c.query("SELECT id FROM people WHERE phone=$1 LIMIT 1",[p.phone]); pid = again.rows[0]?.id; }
    }
    if(!pid){console.log(`seed-state-functionaries: could not resolve ${p.name}; skipping`);continue;}
    const ex = await c.query("SELECT 1 FROM org_assignments WHERE person_id=$1 AND role='state_functionary' AND active=true",[pid]);
    if(ex.rows.length){ skipped++; continue; }
    await c.query("INSERT INTO org_assignments (person_id,geo_node_id,role,active) VALUES ($1,$2,'state_functionary',true)",[pid,sid]);
    linked++;
  }
  console.log(`seed-state-functionaries: created ${created} people, granted ${linked} functionary roles, ${skipped} already set.`);
}catch(e){console.error("seed-state-functionaries: ERROR",e.message);process.exitCode=1;}finally{await c.end();}
