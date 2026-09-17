"use client";
import { useState } from "react";

type Msgs = Record<string, string>;

export default function LoginForm({ m }: { m: Msgs }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const errMsg = (e: string) => `${m[`err_${e}`] || m.err_generic}${e && e !== "generic" ? ` (${e})` : ""}`;

  async function login() {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) { setError(m.err_bad_phone); return; }
    if (!password.trim()) { setError(errMsg("bad_input")); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/member/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        console.error("[login] failed", { status: r.status, body: d });
        setError(errMsg(d.error || "generic"));
        return;
      }
      window.location.href = "/app";
    } catch (e) {
      console.error("[login] network error", e);
      setError(m.err_generic);
    } finally { setBusy(false); }
  }

  return (
    <div>
      <label className="asm-fld">{m.phone_label}</label>
      <input
        className="asm-input" inputMode="numeric" autoFocus value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder={m.phone_ph}
      />

      <label className="asm-fld">{m.password_label}</label>
      <input
        className="asm-input" value={password} autoCapitalize="none" autoCorrect="off" spellCheck={false}
        onChange={(e) => setPassword(e.target.value.replace(/\s/g, "").slice(0, 8))}
        placeholder={m.password_ph}
        onKeyDown={(e) => { if (e.key === "Enter") login(); }}
      />

      <button className="asm-btn" onClick={login} disabled={busy}>
        {busy ? m.sending : `${m.login_btn} →`}
      </button>
      <div className="asm-helper">{m.login_sub}</div>
      {error && <p className="asm-error">{error}</p>}
    </div>
  );
}
