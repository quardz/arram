"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type P = { id: number; name: string | null; phone: string; present: boolean };
export default function AttendanceMarker({ eventId, m }: { eventId: number; m: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<P[]>([]);
  const [loading, setLoading] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/member/attendance/${eventId}/people?q=${encodeURIComponent(term)}`);
      const d = await r.json();
      if (d.ok) setPeople(d.people);
    } finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { load(""); }, [load]);

  function onSearch(v: string) {
    setQ(v);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => load(v), 300);
  }

  async function toggle(p: P) {
    const present = !p.present;
    setPeople((xs) => xs.map((x) => (x.id === p.id ? { ...x, present } : x)));
    await fetch(`/api/member/attendance/${eventId}/mark`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId: p.id, present }),
    }).catch(() => {});
  }

  async function quickAdd() {
    if (!addName.trim() || !/^[6-9]\d{9}$/.test(addPhone)) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/member/attendance/${eventId}/quickadd`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, phone: addPhone }),
      });
      const d = await r.json();
      if (r.ok && d.ok) { setAddName(""); setAddPhone(""); await load(q); }
    } finally { setBusy(false); }
  }

  const presentCount = people.filter((p) => p.present).length;

  return (
    <div className="space-y-4">
      <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder={m.att_search_ph}
        className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900" />
      <p className="text-sm text-neutral-500">{presentCount} {m.att_present_count}{loading ? " · …" : ""}</p>

      <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {people.map((p) => (
          <li key={p.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{p.name && p.name !== "multiple" ? p.name : p.phone}</div>
              <div className="text-xs text-neutral-400">{p.phone}</div>
            </div>
            <button onClick={() => toggle(p)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${p.present ? "bg-green-600 text-white" : "border border-neutral-300 text-neutral-600"}`}>
              {p.present ? "✓ " + m.att_present : m.att_present}
            </button>
          </li>
        ))}
        {people.length === 0 && !loading && (
          <li className="p-4 text-center text-sm text-neutral-500">{m.att_none_found}</li>
        )}
      </ul>

      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-neutral-700">{m.att_add_new}</p>
        <div className="space-y-2">
          <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder={m.att_new_name_ph}
            className="w-full rounded-xl border border-neutral-300 px-4 py-2 outline-none focus:border-neutral-900" />
          <input value={addPhone} inputMode="numeric" onChange={(e) => setAddPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder={m.att_new_phone_ph}
            className="w-full rounded-xl border border-neutral-300 px-4 py-2 outline-none focus:border-neutral-900" />
          <button onClick={quickAdd} disabled={busy || !addName.trim() || !/^[6-9]\d{9}$/.test(addPhone)}
            className="w-full rounded-xl bg-neutral-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{m.att_add}</button>
        </div>
      </div>
    </div>
  );
}
