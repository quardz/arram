"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Admin-only delete for a campaign (parent + its sessions + records) or a local
// attendance event. Two-tap confirm (no browser dialog, which would block the app).
export default function DeleteEventButton({
  eventId, kind, redirectTo, m, variant = "full",
}: {
  eventId: number;
  kind: "campaign_parent" | "local";
  redirectTo?: string;                 // where to go after a campaign delete
  m: Record<string, string>;
  variant?: "full" | "icon";
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function doDelete() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/member/attendance/delete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const d = await r.json();
      if (r.ok && d.ok) {
        if (redirectTo) window.location.href = redirectTo;
        else router.refresh();
        return;
      }
      setErr(m.err_generic || "Error"); setBusy(false); setConfirming(false);
    } catch { setErr(m.err_generic || "Error"); setBusy(false); setConfirming(false); }
  }

  const label = kind === "campaign_parent" ? (m.att_delete_campaign || "Delete campaign") : (m.att_delete_local || "Delete");

  if (variant === "icon" && !confirming) {
    return <button className="att-del-icon" aria-label={label} title={label} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(true); }}>🗑</button>;
  }
  if (!confirming) {
    return <button className="asm-btn ghost att-del-btn" onClick={() => setConfirming(true)}>🗑 {label}</button>;
  }
  return (
    <span className="att-del-confirm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <span className="att-del-q">{m.att_delete_confirm || "Delete permanently?"}</span>
      <button className="asm-btn danger att-del-yes" disabled={busy} onClick={doDelete}>{m.att_delete_yes || "Delete"}</button>
      <button className="asm-btn ghost att-del-no" disabled={busy} onClick={() => setConfirming(false)}>{m.org_cancel || "Cancel"}</button>
      {err && <span className="asm-error" style={{ marginLeft: 8 }}>{err}</span>}
    </span>
  );
}
