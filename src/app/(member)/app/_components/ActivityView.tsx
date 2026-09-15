"use client";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: number; action: string; detail: string | null; at: string;
  actor: string | null; impersonated: string | null; event: string | null;
};

export default function ActivityView({ isAdmin, m }: { isAdmin: boolean; m: Record<string, string> }) {
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (s: "mine" | "all") => {
    setLoading(true);
    try {
      const r = await fetch(`/api/member/activity?scope=${s}`);
      const d = await r.json();
      if (d.ok) setRows(d.rows as Row[]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(scope); }, [scope, load]);

  const label = (a: string) => m[`act_${a}`] || a;
  const fmt = (s: string) => { try { return new Date(s).toLocaleString(); } catch { return s; } };

  return (
    <div>
      {isAdmin && (
        <div className="asm-seg">
          <button className={scope === "mine" ? "on" : ""} onClick={() => setScope("mine")}>{m.act_mine}</button>
          <button className={scope === "all" ? "on" : ""} onClick={() => setScope("all")}>{m.act_everyone}</button>
        </div>
      )}
      {loading ? (
        <p className="asm-note">{m.act_loading || "…"}</p>
      ) : rows.length === 0 ? (
        <div className="asm-empty"><div className="big">🗒️</div>{m.act_empty}</div>
      ) : (
        <ul className="asm-log">
          {rows.map((r) => (
            <li key={r.id} className="asm-logitem">
              <div className="asm-logtop">
                <span className="asm-logaction">{label(r.action)}</span>
                <span className="asm-logtime">{fmt(r.at)}</span>
              </div>
              <div className="asm-logdetail">
                {scope === "all" && r.actor ? <b>{r.actor}</b> : null}
                {r.detail ? <span> · {r.detail}</span> : null}
                {r.event ? <span> · {r.event}</span> : null}
                {r.impersonated ? <span className="asm-logtag"> ({m.act_as} {r.impersonated})</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
