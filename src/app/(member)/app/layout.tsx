import type { ReactNode } from "react";
import { cookies } from "next/headers";
import "./theme.css";
import ImpersonationBanner from "./_components/ImpersonationBanner";
import Analytics from "@/components/Analytics";

export const metadata = { title: "ASM உறுப்பினர்", robots: { index: false } };

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const theme = (await cookies()).get("theme")?.value;
  const themeAttr = theme === "dark" || theme === "light" ? theme : undefined;
  return (
    <html lang="ta" {...(themeAttr ? { "data-theme": themeAttr } : {})}>
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
        <Analytics />
      </body>
    </html>
  );
}
