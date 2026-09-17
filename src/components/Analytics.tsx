"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Google Analytics (GA4). Loads only when NEXT_PUBLIC_GA_ID is set, so the app
 * builds and runs fine with analytics off. One property covers both the public
 * site and the member app; segment app traffic by the /app path in GA.
 * NEXT_PUBLIC_ is inlined at build, so this reads the id directly on the client.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export default function Analytics({ userId }: { userId?: string }) {
  const pathname = usePathname();
  const first = useRef(true);

  // gtag config sends the first page_view; fire one on each later soft navigation.
  useEffect(() => {
    if (!GA_ID) return;
    if (first.current) { first.current = false; return; }
    window.gtag?.("event", "page_view", { page_path: pathname, ...(userId ? { user_id: userId } : {}) });
  }, [pathname, userId]);

  if (!GA_ID) return null;
  // user_id ties all events to one member across sessions/devices (internal id
  // only — never phone/name, which would violate Google's PII policy).
  const cfg = userId ? `, { user_id: ${JSON.stringify(userId)} }` : "";
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}'${cfg});`}
      </Script>
    </>
  );
}
