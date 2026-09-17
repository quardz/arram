"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

type P = { id: number; name: string | null; phone: string; present: boolean; union: string | null; pincode: string | null };

const DISPLAY_CAP = 100; // rows rendered at once while searching
const IDLE_COUNT = 10;   // rows shown (alphabetical) when nothing is filtered
const NONE = "__none__"; // select value for missing union/pincode

function displayName(p: P) { return p.name && p.name !== "multiple" ? p.name : p.phone; }
function initials(p: P) { const s = displayName(p).trim(); return s ? s[0] : "?"; }
const matchUnion = (p: P, f: string) => !f || (f === NONE ? !p.union : p.union === f);
const matchPin = (p: P, f: string) => !f || (f === NONE ? !p.pincode : p.pincode === f);

export default function AttendanceMarker({ eventId, m, open = true, canAdd = true }: { eventId: number; m: Record<string, string>; open?: boolean; canAdd?: boolean }) {
  const [all, setAll] = useState<P[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"select" | "selected">("select");
  const [q, setQ] = useState("");
  const [unionF, setUnionF] = useState("");
  const [pinF, setPinF] = useState("");
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
  // Select tab shows only people NOT yet marked present — once selected, they
  // move to the Selected tab and disappear from here.
  const selectable = useMemo(() => all.filter((p) => !p.present), [all]);

  // distinct unions (for the first filter)
  const unions = useMemo(() => {
    const map = new Map<string, { value: string; label: string; count: number }>();
    for (const p of selectable) {
      const v = p.union ?? NONE; const label = p.union || m.att_no_union;
      const e = map.get(v) || { value: v, label, count: 0 }; e.count++; map.set(v, e);
    }
    return [...map.values()].sort((a, b) => a.value === NONE ? 1 : b.value === NONE ? -1 : a.label.localeCompare(b.label));
  }, [selectable, m]);

  // distinct pincodes within the chosen union (dependent second filter)
  const pincodes = useMemo(() => {
    const pool = unionF ? selectable.filter((p) => matchUnion(p, unionF)) : selectable;
    const map = new Map<string, { value: string; label: string; count: number }>();
    for (const p of pool) {
      const v = p.pincode ?? NONE; const label = p.pincode || m.att_no_pincode;
      const e = map.get(v) || { value: v, label, count: 0 }; e.count++; map.set(v, e);
    }
    return [...map.values()].sort((a, b) => a.value === NONE ? 1 : b.value === NONE ? -1 : a.label.localeCompare(b.label));
  }, [selectable, unionF, m]);

  const { view, truncated } = useMemo(() => {
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    let list = selectable.filter((p) => matchUnion(p, unionF) && matchPin(p, pinF));
    if (term) list = list.filter((p) => {
      const nm = (p.name || "").toLowerCase();
      return nm.includes(term) || (digits && p.phone.includes(digits)) || (digits && (p.pincode || "").includes(digits));
    });
    const active = term || unionF || pinF;
    if (!active) return { view: list.slice(0, IDLE_COUNT), truncated: list.length > IDLE_COUNT };
    return { view: list.slice(0, DISPLAY_CAP), truncated: list.length > DISPLAY_CAP };
  }, [q, selectable, unionF, pinF]);

  // present people grouped: union → pincode
  const grouped = useMemo(() => {
    const uMap = new Map<string, { label: string; pins: Map<string, { label: string; items: P[] }> }>();
    for (const p of present) {
      const uv = p.union ?? NONE, ul = p.union || m.att_no_union;
      const pv = p.pincode ?? NONE, pl = p.pincode || m.att_no_pincode;
      let u = uMap.get(uv); if (!u) { u = { label: ul, pins: new Map() }; uMap.set(uv, u); }
      let pg = u.pins.get(pv); if (!pg) { pg = { label: pl, items: [] }; u.pins.set(pv, pg); }
      pg.items.push(p);
    }
    const sortE = <T extends { label: string }>(mp: Map<string, T>) =>
      [...mp.entries()].sort((a, b) => a[0] === NONE ? 1 : b[0] === NONE ? -1 : a[1].label.localeCompare(b[1].label));
    return sortE(uMap).map(([uv, u]) => ({
      key: uv, label: u.label,
      count: [...u.pins.values()].reduce((n, g) => n + g.items.length, 0),
      pins: sortE(u.pins).map(([pv, g]) => ({ key: pv, label: g.label, items: g.items })),
    }));
  }, [present, m]);

  async function toggle(p: P) {
    if (!open) return;
    const nowPresent = !p.present;
    setAll((xs) => xs.map((x) => (x.id === p.id ? { ...x, present: nowPresent } : x)));
    await fetch(`/api/member/attendance/${eventId}/mark`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId: p.id, present: nowPresent }),
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
      <button className={`asm-mark ${p.present ? "on" : ""}`} onClick={() => toggle(p)} disabled={!open} aria-label={m.att_present}>
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
          <div className="asm-filters">
            <select className="asm-input asm-select" value={unionF}
              onChange={(e) => { setUnionF(e.target.value); setPinF(""); }}>
              <option value="">{m.att_all_unions}</option>
              {unions.map((u) => <option key={u.value} value={u.value}>{u.label} ({u.count})</option>)}
            </select>
            <select className="asm-input asm-select" value={pinF} onChange={(e) => setPinF(e.target.value)}>
              <option value="">{m.att_all_pincodes}</option>
              {pincodes.map((p) => <option key={p.value} value={p.value}>{p.label} ({p.count})</option>)}
            </select>
          </div>
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
          {!canAdd ? null : !showAdd ? (
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
            grouped.map((u) => (
              <div key={u.key} className="asm-group">
                <div className="asm-group-hd">{u.label} <span>({u.count})</span></div>
                {u.pins.map((pin) => (
                  <div key={pin.key}>
                    <div className="asm-subgroup-hd">📍 {pin.label} <span>({pin.items.length})</span></div>
                    <ul className="asm-people">{pin.items.map(row)}</ul>
                  </div>
                ))}
              </div>
            ))
          )}
          <a className="asm-btn ghost" style={{ marginTop: 18 }} href={`/app/attendance/${eventId}/print`}>⬇ {m.att_export_pdf}</a>
        </>
      )}
    </div>
  );
}
