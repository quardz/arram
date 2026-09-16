"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = { id: number; name: string };

/** All times are entered in IST (the app is Tamil Nadu only); we attach the
 *  +05:30 offset so the stored instant is unambiguous regardless of server tz. */
function istToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(`${local}:00+05:30`);
  return isNaN(+d) ? null : d.toISOString();
}

export default function CampaignForm({ campaigns, m }: { campaigns: Campaign[]; m: Record<string, string> }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [funnelParentId, setFunnelParentId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const valid = name.trim() && start && end && istToIso(start) && istToIso(end) && new Date(`${end}:00+05:30`) > new Date(`${start}:00+05:30`);

  async function create() {
    if (!valid) { setError(m.cf_bad); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/member/attendance/create-campaign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          startAt: istToIso(start),
          endAt: istToIso(end),
          funnelParentId: funnelParentId || undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) { setError(m[`err_${d.error}`] || m.err_generic); return; }
      router.push(`/app/attendance/${d.id}`);
    } catch { setError(m.err_generic); } finally { setBusy(false); }
  }

  return (
    <div>
      <label className="asm-fld">{m.cf_name}</label>
      <input className="asm-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={m.cf_name_ph} />

      <label className="asm-fld">{m.cf_parent}</label>
      <select className="asm-input asm-select" value={funnelParentId} onChange={(e) => setFunnelParentId(e.target.value)}>
        <option value="">{m.cf_parent_none}</option>
        {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label className="asm-fld">{m.cf_start}</label>
      <input className="asm-input" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />

      <label className="asm-fld">{m.cf_end}</label>
      <input className="asm-input" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />

      <button className="asm-btn gold" onClick={create} disabled={busy || !valid}>{m.cf_create} ✚</button>
      {error && <p className="asm-error">{error}</p>}
    </div>
  );
}
