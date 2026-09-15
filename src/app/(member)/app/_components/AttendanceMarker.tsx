"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type P = { id: number; name: string | null; phone: string; present: boolean };

function initials(name: string | null, phone: string) {
  const s = (name && name !== "multiple" ? name : phone).trim();
  return s ? s[0] : "?";
}

export default function AttendanceMarker({ eventId, m }: { eventId: number; m: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<P[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
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
      if (r.ok && d.ok) { setAddName(""); setAddPhone(""); setShowAdd(false); await load(q); }
    } finally { setBusy(false); }
  }

  const presentCount = people.filter((p) => p.present).length;

  return (
    <div>
      <div className="asm-search">
        <span className="mag" aria-hidden>🔍</span>
        <input className="asm-input" value={q} onChange={(e) => onSearch(e.target.value)} placeholder={m.att_search_ph} />
      </div>
      <p className="asm-note"><b>{presentCount}</b> {m.att_present_count}{loading ? " · …" : ""}</p>

      <ul className="asm-people">
        {people.map((p) => (
          <li key={p.id} className="asm-person">
            <span className="asm-avatar">{initials(p.name, p.phone)}</span>
            <span className="asm-pnm">
              <b>{p.name && p.name !== "multiple" ? p.name : p.phone}</b>
              <small>{p.phone}</small>
            </span>
            <button className={`asm-mark ${p.present ? "on" : ""}`} onClick={() => toggle(p)}
              aria-label={p.present ? m.att_present : m.att_present}>
              {p.present ? "✓" : "＋"}
            </button>
          </li>
        ))}
        {people.length === 0 && !loading && (
          <li className="asm-note" style={{ padding: "18px 0" }}>{m.att_none_found}</li>
        )}
      </ul>

      {!showAdd ? (
        <button className="asm-btn ghost" style={{ marginTop: 18 }} onClick={() => setShowAdd(true)}>
          ＋ {m.att_add_new}
        </button>
      ) : (
        <div className="asm-quick">
          <p className="qh">{m.att_add_new}</p>
          <input className="asm-input" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder={m.att_new_name_ph} />
          <input className="asm-input" value={addPhone} inputMode="numeric"
            onChange={(e) => setAddPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder={m.att_new_phone_ph} />
          <button className="asm-btn" onClick={quickAdd} disabled={busy || !addName.trim() || !/^[6-9]\d{9}$/.test(addPhone)}>
            {m.att_add}
          </button>
        </div>
      )}
    </div>
  );
}
