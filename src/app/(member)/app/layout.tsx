import type { ReactNode } from "react";
import "./theme.css";
import ImpersonationBanner from "./_components/ImpersonationBanner";

export const metadata = { title: "ASM உறுப்பினர்", robots: { index: false } };

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ta">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="asm-shell">
          <ImpersonationBanner />
          {children}
        </div>
      </body>
    </html>
  );
}
