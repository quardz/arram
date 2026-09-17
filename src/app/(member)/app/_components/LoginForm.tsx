"use client";
import { useState } from "react";

type Msgs = Record<string, string>;

export default function LoginForm({ m }: { m: Msgs }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dev, setDev] = useState<string | null>(null);

  // Map an error code to a message, and append the code so it's reportable
  // even without opening the console (helps debugging in the field).
  const errMsg = (e: string) => `${m[`err_${e}`] || m.err_generic}${e && e !== "generic" ? ` (${e})` : ""}`;

  async function sendOtp() {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) { setError(m.err_bad_phone); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/member/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        console.error("[login] request-otp failed", { status: r.status, body: d });
        setError(errMsg(d.error || "generic"));
        return;
      }
      if (d.devCode) setDev(d.devCode);
      setStep("otp");
    } catch (e) {
      console.error("[login] request-otp network error", e);
      setError(m.err_generic);
    } finally { setBusy(false); }
  }

  async function verify() {
    setError("");
    if (!/^\d{4,8}$/.test(code)) { setError(errMsg("bad_input")); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/member/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        console.error("[login] verify-otp failed", { status: r.status, body: d });
        setError(errMsg(d.error || "generic"));
        return;
      }
      window.location.href = "/app";
    } catch (e) {
      console.error("[login] verify-otp network error", e);
      setError(m.err_generic);
    } finally { setBusy(false); }
  }

  if (step === "phone") {
    return (
      <div>
        <label className="asm-fld">{m.phone_label}</label>
        <input
          className="asm-input" inputMode="numeric" autoFocus value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder={m.phone_ph}
        />
        <button className="asm-btn" onClick={sendOtp} disabled={busy}>
          {busy ? m.sending : `${m.send_otp} →`}
        </button>
        <div className="asm-helper">{m.otp_hint || m.login_sub}</div>
        {error && <p className="asm-error">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="asm-fld">{m.otp_label}</label>
      <input
        className="asm-input asm-otp" inputMode="numeric" autoFocus value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
        placeholder={m.otp_ph}
      />
      <button className="asm-btn" onClick={verify} disabled={busy}>
        {busy ? m.verifying : `${m.verify} ✓`}
      </button>
      <div className="asm-links">
        <button onClick={() => { setStep("phone"); setCode(""); setError(""); setDev(null); }}>← {m.change_number}</button>
        <button onClick={sendOtp} disabled={busy}>{m.resend}</button>
      </div>
      {dev && <p className="asm-devcode">DEV OTP: {dev}</p>}
      {error && <p className="asm-error">{error}</p>}
    </div>
  );
}
