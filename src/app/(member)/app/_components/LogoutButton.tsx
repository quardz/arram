"use client";
export default function LogoutButton({ label }: { label: string }) {
  async function logout() {
    await fetch("/api/member/logout", { method: "POST" });
    window.location.href = "/app/login";
  }
  return (
    <button onClick={logout} className="asm-btn ghost" style={{ maxWidth: 220, margin: "0 auto" }}>
      {label}
    </button>
  );
}
