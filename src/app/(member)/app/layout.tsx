import type { ReactNode } from "react";

export const metadata = { title: "ASM Members", robots: { index: false } };

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <div className="mx-auto w-full max-w-md px-4 py-6">{children}</div>
    </div>
  );
}
