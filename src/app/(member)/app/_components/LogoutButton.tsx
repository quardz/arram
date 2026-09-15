"use client";
export default function LogoutButton({ label }: { label: string }) {
  async function logout() {
    await fetch("/api/member/logout", { method: "POST" });
    window.location.href = "/app/login";
  }
  return (
    <button onClick={logout} className="rounded-xl border border-neutral-300 px-4 py-2 font-medium">
      {label}
    </button>
  );
}
