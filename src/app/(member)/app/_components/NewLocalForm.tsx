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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700">{m.att_title_label}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={m.att_session_title_ph}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">{m.att_pick_district}</label>
        <select value={districtId} onChange={(e) => setDistrictId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900">
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">{m.att_date}</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900" />
      </div>
      <button onClick={create} disabled={busy || !title.trim() || !districtId}
        className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-lg font-semibold text-white disabled:opacity-50">
        {m.att_create}
      </button>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
