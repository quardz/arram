"use client";
export default function StopImpersonatingButton({ label }: { label: string }) {
  async function stop() {
    await fetch("/api/member/impersonate/stop", { method: "POST" }).catch(() => {});
    window.location.href = "/app";
  }
  return <button className="asm-imp-stop" onClick={stop}>{label}</button>;
}
