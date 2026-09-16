"use client";
import { useState } from "react";

type Row = { name: string; phone: string; pincode: string };
type Result = { name: string; phone: string; status: "added" | "exists" | "invalid"; reason?: string };

const blank = (): Row => ({ name: "", phone: "", pincode: "" });

export default function BulkAddPeople({ m }: { m: Record<string, string> }) {
  const [rows, setRows] = useState<Row[]>([blank(), blank(), blank()]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState("");

  const update = (i: number, k: keyof Row, v: string) =>
    setRows((xs) => xs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((xs) => [...xs, blank()]);
  const removeRow = (i: number) => setRows((xs) => (xs.length > 1 ? xs.filter((_, j) => j !== i) : xs));

  const filled = rows.filter((r) => r.name.trim() || r.phone.trim());

  async function submit() {
    if (!filled.length) return;
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/member/people/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: filled }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) { setError(m.err_generic); return; }
      setResults(d.results as Result[]);
    } catch { setError(m.err_generic); } finally { setBusy(false); }
  }

  function reset() {
    setResults(null);
    setRows([blank(), blank(), blank()]);
  }

  if (results) {
    const added = results.filter((r) => r.status === "added").length;
    const exists = results.filter((r) => r.status === "exists").length;
    const invalid = results.filter((r) => r.status === "invalid").length;
    return (
      <div>
        <div className="asm-stats">
          <div className="asm-stat"><b>{added}</b><small>{m.bulk_added}</small></div>
          <div className="asm-stat"><b>{exists}</b><small>{m.bulk_exists}</small></div>
          <div className="asm-stat"><b>{invalid}</b><small>{m.bulk_invalid}</small></div>
        </div>
        <ul className="asm-people">
          {results.map((r, i) => (
            <li key={i} className="asm-person">
              <span className="asm-pnm"><b>{r.name || r.phone}</b><small>{r.phone}</small></span>
              <span className={`asm-badge ${r.status === "added" ? "open" : r.status === "exists" ? "upcoming" : "closed"}`}>
                {m[`bulk_${r.status}`] || r.status}
              </span>
            </li>
          ))}
        </ul>
        <button className="asm-btn ghost" style={{ marginTop: 16 }} onClick={reset}>＋ {m.bulk_add_more}</button>
      </div>
    );
  }

  return (
    <div>
      <p className="asm-note">{m.bulk_hint}</p>
      {rows.map((r, i) => (
        <div key={i} className="asm-bulkcard">
          <div className="asm-bulkcard-hd">
            <span className="n">{m.bulk_person} {i + 1}</span>
            {rows.length > 1 && (
              <button type="button" className="asm-rowdel" onClick={() => removeRow(i)}>× {m.bulk_remove}</button>
            )}
          </div>
          <input className="asm-input" value={r.name} onChange={(e) => update(i, "name", e.target.value)} placeholder={m.bulk_name_ph} />
          <input className="asm-input" inputMode="numeric" value={r.phone}
            onChange={(e) => update(i, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder={m.bulk_phone_ph} />
          <input className="asm-input" inputMode="numeric" value={r.pincode}
            onChange={(e) => update(i, "pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder={m.bulk_pincode_ph} />
        </div>
      ))}
      <button type="button" className="asm-btn ghost" onClick={addRow}>＋ {m.bulk_add_row}</button>
      {error && <p className="asm-error">{error}</p>}
      <button className="asm-btn gold" style={{ marginTop: 14 }} onClick={submit} disabled={busy || !filled.length}>
        {busy ? m.bulk_saving : `${m.bulk_save} (${filled.length})`}
      </button>
    </div>
  );
}
