// Imports the ASS district people rolls (data/people/*.pdf → scripts/district_people.json)
// into the people table. Runs in vercel-build after migrate/seed (DB reachable there).
//
// District comes from the FILE, not the row (the in-PDF Tamil district column is
// font-garbled). Each district key resolves to a UNIQUE live geo_nodes district
// by name pattern AT RUN TIME — if a pattern matches 0 or >1 districts we SKIP
// that key and report it (never guess), and we do NOT mark the run complete, so a
// later deploy retries it once the org node is made unique.
//
// Upsert policy (confirmed): new phone → insert (source excel-import); existing
// phone → overwrite geo_node always, overwrite name only when we have one (garbled
// names are blank and must not wipe a good existing name), fill pincode when present.
//
// One-shot: guarded by a seed_runs marker so a completed run never repeats.
import fs from "node:fs"; import path from "node:path"; import pg from "pg";
function loadEnvLocal(){try{const t=fs.readFileSync(path.resolve(process.cwd(),".env.local"),"utf8");for(const l of t.split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);if(m&&!(m[1]in process.env))process.env[m[1]]=m[2].trim().replace(/^["']|["']$/g,"");}}catch{}}
loadEnvLocal();

const MARKER = "district-import-v2"; // bump when new district files / patterns change
// district key -> case-insensitive name pattern(s) for the DISTRICT-level geo node.
// Patterns are matched against the LIVE geo_nodes names (from org_structure.json);
// spelling there differs from other snapshots, so patterns are kept tolerant and
// each key must still resolve to exactly ONE district.
const PATTERNS = {
  kallakurichi:  ["%கள்ள%குறிச்சி%"],                 // live: கள்ளகுறிச்சி
  kovai_kilakku: ["%கோவை%கிழக்கு%"],
  kovai_merkku:  ["%கோவை%மேற்கு%"],
  mettupalayam:  ["%மேட்டு%ளையம்%"],                  // live: மேட்டுபாளையம்
  raveeshwar:    ["%ரவீஸ்வரர்%", "%ரவிஸ்வரர்%", "%வீஸ்வரர்%"], // live: ரவீஸ்வரர்
  thenkasi:      ["%தென்காசி%"],
  viluppuram:    ["%விழுப்புரம்%"],
  virudhunagar:  ["%விருதுநகர்%"],
};
const referral = (phone) => { const n = parseInt(phone,10); return Number.isFinite(n) ? n.toString(36).toUpperCase().padStart(7,"0") : null; };

const url = process.env.DATABASE_URI_DIRECT || process.env.DATABASE_URI;
if(!url){console.log("import-district-people: no DB url; skipping");process.exit(0);}
const dataFile = process.argv[2] || new URL("./district_people.json", import.meta.url).pathname;
if(!fs.existsSync(dataFile)){console.log(`import-district-people: ${dataFile} missing; skipping`);process.exit(0);}
const rows = JSON.parse(fs.readFileSync(dataFile,"utf8"));

const c = new pg.Client({connectionString:url});
try{
  await c.connect();
  await c.query("CREATE TABLE IF NOT EXISTS seed_runs (name text PRIMARY KEY, ran_at timestamptz DEFAULT now())");
  const done = await c.query("SELECT 1 FROM seed_runs WHERE name=$1",[MARKER]);
  if(done.rows.length){console.log(`import-district-people: '${MARKER}' already ran; skipping`);process.exit(0);}

  // Resolve each district key to a unique district node.
  const keys = [...new Set(rows.map(r=>r.dk))];
  const idFor = {}; const unresolved = [];
  for(const dk of keys){
    const pats = PATTERNS[dk];
    if(!pats || !pats.length){ unresolved.push(`${dk} (no pattern)`); continue; }
    // Union matches across all of the key's patterns, dedup by id.
    const found = new Map();
    for(const pat of pats){
      const r = await c.query("SELECT id,name FROM geo_nodes WHERE level='district' AND name ILIKE $1 AND (merged_into_id IS NULL)",[pat]);
      for(const row of r.rows) found.set(row.id, row.name);
    }
    if(found.size===1){ const [id,name]=[...found][0]; idFor[dk]=id; console.log(`  ${dk} → [${id}] ${name}`); }
    else { unresolved.push(`${dk} → ${found.size} matches [${[...found.values()].join(" | ")}]`); }
  }
  if(unresolved.length) console.log("import-district-people: UNRESOLVED (skipped this run):\n  - " + unresolved.join("\n  - "));

  const doable = rows.filter(r=>idFor[r.dk]);
  let inserted=0, updated=0;
  const BATCH=1000;
  for(let i=0;i<doable.length;i+=BATCH){
    const slice=doable.slice(i,i+BATCH);
    const vals=[]; const tuples=slice.map((r,j)=>{
      const b=j*5;
      vals.push(r.ph, r.nm||null, r.pin||null, referral(r.ph), idFor[r.dk]);
      return `($${b+1},$${b+2},$${b+3},'excel-import',false,$${b+4},$${b+5})`;
    }).join(",");
    const q=`INSERT INTO people (phone,name,pincode,source,otp_verified,referral_code,geo_node_id)
      VALUES ${tuples}
      ON CONFLICT (phone) DO UPDATE SET
        geo_node_id = EXCLUDED.geo_node_id,
        name = COALESCE(EXCLUDED.name, people.name),
        pincode = COALESCE(EXCLUDED.pincode, people.pincode),
        updated_at = now()
      RETURNING (xmax = 0) AS inserted`;
    const res=await c.query(q,vals);
    for(const row of res.rows){ if(row.inserted) inserted++; else updated++; }
  }
  console.log(`import-district-people: inserted ${inserted}, updated ${updated} (of ${doable.length} rows across ${Object.keys(idFor).length} districts).`);

  if(unresolved.length){
    console.log("import-district-people: NOT marking complete — will retry unresolved districts on next deploy.");
  } else {
    await c.query("INSERT INTO seed_runs (name) VALUES ($1) ON CONFLICT DO NOTHING",[MARKER]);
    console.log(`import-district-people: marked '${MARKER}' complete.`);
  }
}catch(e){console.error("import-district-people: ERROR",e.message);process.exitCode=1;}finally{await c.end();}
