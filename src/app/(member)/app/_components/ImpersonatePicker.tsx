"use client";
import { useState } from "react";

type Role = { value: string; label: string };
type Cand = { personId: number; name: string; phone: string; node: string };

export default function ImpersonatePicker({ roles, m }: { roles: Role[]; m: Record<string, string> }) {
  const [role, setRole] = useState("");
  const [members, setMembers] = useState<Cand[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onRole(v: string) {
    setRole(v); setMembers([]);
    if (!v) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/member/impersonate/candidates?role=${encodeURIComponent(v)}`);
      const d = await r.json();
      if (d.ok) setMembers(d.members as Cand[]);
    } finally { setLoading(false); }
  }

  async function viewAs(personId: number) {
    setBusy(true);
    try {
      const r = await fetch("/api/member/impersonate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId }),
      });
      const d = await r.json();
      if (r.ok && d.ok) window.location.href = "/app";
      else setBusy(false);
    } catch { setBusy(false); }
  }

  return (
    <div>
      <label className="asm-fld">{m.imp_pick_role}</label>
      <select className="asm-input asm-select" value={role} onChange={(e) => onRole(e.target.value)}>
        <option value="">—</option>
        {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>

      {role && (
        <>
          <label className="asm-fld">{m.imp_pick_member}</label>
          {loading ? (
            <p className="asm-note">{m.act_loading || "…"}</p>
          ) : members.length === 0 ? (
            <div className="asm-empty"><div className="big">👤</div>{m.imp_none}</div>
          ) : (
            <ul className="asm-people">
              {members.map((c) => (
                <li key={c.personId} className="asm-person">
                  <span className="asm-avatar">{c.name[0]}</span>
                  <span className="asm-pnm"><b>{c.name}</b><small>{c.phone}{c.node ? ` · ${c.node}` : ""}</small></span>
                  <button className="asm-add" disabled={busy} onClick={() => viewAs(c.personId)}>{m.imp_view_as_btn}</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
