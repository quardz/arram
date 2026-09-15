"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Msgs = Record<string, string>;

export default function LoginForm({ m }: { m: Msgs }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dev, setDev] = useState<string | null>(null);

  const errMsg = (e: string) => m[`err_${e}`] || m.err_generic;

  async function sendOtp() {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) { setError(m.err_bad_phone); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/member/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json();
      if (!r.ok || !d.ok) { setError(errMsg(d.error || "generic")); return; }
      if (d.devCode) setDev(d.devCode);
      setStep("otp");
    } catch { setError(m.err_generic); } finally { setBusy(false); }
  }

  async function verify() {
    setError("");
    if (!/^\d{4,6}$/.test(code)) { setError(m.err_generic); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/member/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code }) });
      const d = await r.json();
      if (!r.ok || !d.ok) { setError(errMsg(d.error || "generic")); return; }
      window.location.href = "/app";
    } catch { setError(m.err_generic); } finally { setBusy(false); }
  }

  return (
    <div className="mt-6 space-y-4">
      {step === "phone" ? (
        <>
          <label className="block text-sm font-medium text-neutral-700">{m.phone_label}</label>
          <input
            inputMode="numeric" autoFocus value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder={m.phone_ph}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-lg tracking-wide outline-none focus:border-neutral-900"
          />
          <button onClick={sendOtp} disabled={busy}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-lg font-semibold text-white disabled:opacity-50">
            {busy ? m.sending : m.send_otp}
          </button>
        </>
      ) : (
        <>
          <label className="block text-sm font-medium text-neutral-700">{m.otp_label}</label>
          <input
            inputMode="numeric" autoFocus value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder={m.otp_ph}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-neutral-900"
          />
          <button onClick={verify} disabled={busy}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-lg font-semibold text-white disabled:opacity-50">
            {busy ? m.verifying : m.verify}
          </button>
          <div className="flex justify-between text-sm text-neutral-600">
            <button onClick={() => { setStep("phone"); setCode(""); setError(""); }}>{m.change_number}</button>
            <button onClick={sendOtp} disabled={busy}>{m.resend}</button>
          </div>
          {dev && <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">DEV OTP: {dev}</p>}
        </>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
