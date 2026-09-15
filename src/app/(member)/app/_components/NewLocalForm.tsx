"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type District = { id: number; name: string };
export default function NewLocalForm({ districts, m }: { districts: District[]; m: Record<string, string> }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [districtId, setDistrictId] = useState(districts[0]?.id ? String(districts[0].id) : "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!title.trim() || !districtId) return;
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/member/attendance/create-local", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, districtId: Number(districtId), date: new Date(date).toISOString() }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) { setError(m.err_generic); return; }
      router.push(`/app/attendance/${d.id}`);
    } catch { setError(m.err_generic); } finally { setBusy(false); }
  }

  return (
    <div>
      <label className="asm-fld">{m.att_title_label}</label>
      <input className="asm-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={m.att_session_title_ph} />

      <label className="asm-fld">{m.att_pick_district}</label>
      <select className="asm-input asm-select" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
        {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>

      <label className="asm-fld">{m.att_date}</label>
      <input className="asm-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <button className="asm-btn gold" onClick={create} disabled={busy || !title.trim() || !districtId}>
        {m.att_create} ✚
      </button>
      {error && <p className="asm-error">{error}</p>}
    </div>
  );
}
