"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type P = { id: number; name: string | null; phone: string; present: boolean };

const DISPLAY_CAP = 100; // rows rendered at once while searching
const IDLE_COUNT = 10;   // rows shown (alphabetical) when the search box is empty

function displayName(p: P) { return p.name && p.name !== "multiple" ? p.name : p.phone; }
function initials(p: P) { const s = displayName(p).trim(); return s ? s[0] : "?"; }

export default function AttendanceMarker({ eventId, m }: { eventId: number; m: Record<string, string> }) {
  const [all, setAll] = useState<P[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"select" | "selected">("select");
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const r = await fetch(`/api/member/attendance/${eventId}/people`);
      const d = await r.json();
      if (d.ok) setAll(d.people as P[]);
    } finally { setLoaded(true); }
  }, [eventId]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const present = useMemo(() => all.filter((p) => p.present), [all]);
  const presentCount = present.length;

  const { view, truncated } = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return { view: all.slice(0, IDLE_COUNT), truncated: all.length > IDLE_COUNT };
    const digits = term.replace(/\D/g, "");
    const matches = all.filter((p) => {
      const nm = (p.name || "").toLowerCase();
      return nm.includes(term) || (digits && p.phone.includes(digits));
    });
    return { view: matches.slice(0, DISPLAY_CAP), truncated: matches.length > DISPLAY_CAP };
  }, [q, all]);

  async function toggle(p: P) {
    const present = !p.present;
    setAll((xs) => xs.map((x) => (x.id === p.id ? { ...x, present } : x)));
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
      if (r.ok && d.ok) { setAddName(""); setAddPhone(""); setShowAdd(false); await loadAll(); }
    } finally { setBusy(false); }
  }

  const row = (p: P) => (
    <li key={p.id} className="asm-person">
      <span className="asm-avatar">{initials(p)}</span>
      <span className="asm-pnm"><b>{displayName(p)}</b><small>{p.phone}</small></span>
      <button className={`asm-mark ${p.present ? "on" : ""}`} onClick={() => toggle(p)} aria-label={m.att_present}>
        {p.present ? "✓" : "＋"}
      </button>
    </li>
  );

  return (
    <div>
      <div className="asm-seg">
        <button className={tab === "select" ? "on" : ""} onClick={() => setTab("select")}>{m.att_tab_select}</button>
        <button className={tab === "selected" ? "on" : ""} onClick={() => setTab("selected")}>{m.att_tab_selected} ({presentCount})</button>
      </div>

      {tab === "select" ? (
        <>
          <div className="asm-search">
            <span className="mag" aria-hidden>🔍</span>
            <input className="asm-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={m.att_search_ph} inputMode="text" />
          </div>
          <p className="asm-note">
            <b>{presentCount}</b> {m.att_present_count}{loaded ? ` · ${all.length} ${m.att_people || ""}` : ` · ${m.att_loading || "…"}`}
          </p>
          <ul className="asm-people">
            {view.map(row)}
            {loaded && view.length === 0 && <li className="asm-note" style={{ padding: "22px 0" }}>{m.att_none_found}</li>}
          </ul>
          {truncated && <p className="asm-note">{m.att_refine || "…"}</p>}
          {!showAdd ? (
            <button className="asm-btn ghost" style={{ marginTop: 18 }} onClick={() => setShowAdd(true)}>＋ {m.att_add_new}</button>
          ) : (
            <div className="asm-quick">
              <p className="qh">{m.att_add_new}</p>
              <input className="asm-input" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder={m.att_new_name_ph} />
              <input className="asm-input" value={addPhone} inputMode="numeric" onChange={(e) => setAddPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder={m.att_new_phone_ph} />
              <button className="asm-btn" onClick={quickAdd} disabled={busy || !addName.trim() || !/^[6-9]\d{9}$/.test(addPhone)}>{m.att_add}</button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="asm-note"><b>{presentCount}</b> {m.att_present_count}</p>
          {presentCount === 0 ? (
            <div className="asm-empty"><div className="big">🙌</div>{m.att_none_selected || m.att_no_sessions}</div>
          ) : (
            <ul className="asm-people">{present.map(row)}</ul>
          )}
          <a className="asm-btn ghost" style={{ marginTop: 18 }} href={`/app/attendance/${eventId}/print`}>⬇ {m.att_export_pdf}</a>
        </>
      )}
    </div>
  );
}
