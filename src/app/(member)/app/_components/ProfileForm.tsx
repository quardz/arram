"use client";
import { useState } from "react";

type Social = { platform: string; url: string };
type Init = { name: string; primaryPhone: string; email: string; secondaryPhone: string; socialLinks: Social[]; fullTime: boolean };

export default function ProfileForm({ initial, roleText, isAdmin, readOnly = false, m }: { initial: Init; roleText: string; isAdmin: boolean; readOnly?: boolean; m: Record<string, string> }) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [sec, setSec] = useState(initial.secondaryPhone);
  const [social, setSocial] = useState<Social[]>(initial.socialLinks);
  const [fullTime, setFullTime] = useState(initial.fullTime);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const addSocial = () => setSocial((s) => [...s, { platform: "", url: "" }]);
  const upSocial = (i: number, k: keyof Social, v: string) => setSocial((s) => s.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const rmSocial = (i: number) => setSocial((s) => s.filter((_, j) => j !== i));

  async function save() {
    if (readOnly) return;
    setErr(""); setMsg("");
    if (!name.trim()) { setErr("⚠ " + m.prof_name); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/member/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, secondaryPhone: sec, socialLinks: social, ...(isAdmin ? { fullTime } : {}) }),
      });
      const d = await r.json();
      if (r.ok && d.ok) setMsg(m.prof_saved);
      else setErr(d.error === "bad_email" ? m.prof_bad_email : d.error === "bad_phone" ? m.prof_bad_phone : (m.err_generic || "Error"));
    } catch { setErr(m.err_generic || "Error"); } finally { setBusy(false); }
  }

  return (
    <div>
      <label className="asm-fld">{m.prof_name}</label>
      <input className="asm-input" value={name} onChange={(e) => setName(e.target.value)} disabled={readOnly} />

      <label className="asm-fld">{m.prof_primary_phone}</label>
      <input className="asm-input" value={initial.primaryPhone} disabled />

      <label className="asm-fld">{m.prof_secondary_phone}</label>
      <input className="asm-input" value={sec} inputMode="numeric" onChange={(e) => setSec(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="90000 00000" disabled={readOnly} />

      <label className="asm-fld">{m.prof_email}</label>
      <input className="asm-input" value={email} inputMode="email" onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" disabled={readOnly} />

      <label className="asm-fld">{m.prof_role}</label>
      <input className="asm-input" value={roleText} disabled />

      <label className="asm-fld">{m.prof_fulltime}{!isAdmin ? <span className="prof-hint"> · {m.prof_fulltime_admin_only}</span> : null}</label>
      {isAdmin ? (
        <div className="asm-seg" style={{ maxWidth: 240 }}>
          <button className={fullTime ? "on" : ""} onClick={() => setFullTime(true)}>{m.yes}</button>
          <button className={!fullTime ? "on" : ""} onClick={() => setFullTime(false)}>{m.no}</button>
        </div>
      ) : (
        <input className="asm-input" value={fullTime ? m.yes : m.no} disabled />
      )}

      <label className="asm-fld">{m.prof_social}</label>
      {social.map((s, i) => (
        <div key={i} className="prof-social-row">
          <input className="asm-input" value={s.platform} onChange={(e) => upSocial(i, "platform", e.target.value)} placeholder={m.prof_platform} disabled={readOnly} />
          <input className="asm-input" value={s.url} onChange={(e) => upSocial(i, "url", e.target.value)} placeholder={m.prof_link} disabled={readOnly} />
          {!readOnly && <button className="prof-rm" aria-label="remove" onClick={() => rmSocial(i)}>✕</button>}
        </div>
      ))}
      {!readOnly && <button className="asm-btn ghost" style={{ marginTop: 10 }} onClick={addSocial}>＋ {m.prof_add_social}</button>}

      {!readOnly && <button className="asm-btn" onClick={save} disabled={busy}>{m.prof_save}</button>}
      {msg && <p className="asm-helper">{msg}</p>}
      {err && <p className="asm-error">{err}</p>}
    </div>
  );
}
