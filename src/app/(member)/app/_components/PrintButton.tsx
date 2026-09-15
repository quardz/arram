"use client";
export default function PrintButton({ label }: { label: string }) {
  return <button className="asm-btn" onClick={() => window.print()}>{label}</button>;
}
