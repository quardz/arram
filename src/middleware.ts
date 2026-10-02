import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_APP = ["/app/login", "/app/no-access"];

// Allowed visitor countries for the public site (ISO-2). Override with
// ALLOW_COUNTRIES="IN,LK,..." in env. Non-allowed traffic is cut at the edge
// before it can reach a page/API/image function.
const ALLOW = new Set(
  (process.env.ALLOW_COUNTRIES || "IN").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
);
// Keep major search crawlers (they crawl from non-IN IPs) so SEO isn't lost.
const SEARCH_BOTS = /(googlebot|bingbot|duckduckbot|applebot|yandexbot|baiduspider|slurp|petalbot)/i;

function regionAllowed(req: NextRequest): boolean {
  const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  if (!country) return true;                         // local/dev or undetectable → allow
  if (ALLOW.has(country)) return true;
  if (SEARCH_BOTS.test(req.headers.get("user-agent") || "")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Members/admins may travel abroad — never geo-block the member app or its API.
  const isAppArea = pathname.startsWith("/app") || pathname.startsWith("/api/member");

  if (!isAppArea && !regionAllowed(req)) {
    return new NextResponse("This site is available only in India.", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Existing auth gate for the member app.
  if (pathname.startsWith("/app")) {
    if (PUBLIC_APP.some((p) => pathname.startsWith(p))) return NextResponse.next();
    if (!req.cookies.get("asm_session")) {
      const url = req.nextUrl.clone();
      url.pathname = "/app/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

// Run on pages, /api, /admin and /_next/image (geo-checked), but skip cheap
// immutable static assets so we don't add an edge hit to every file.
export const config = {
  matcher: [
    "/((?!_next/static|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|woff|woff2|txt|xml)$).*)",
  ],
};
