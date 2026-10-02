import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/app/login", "/app/no-access"];

// Auth gate only. Geo/bot restriction is enforced at the Vercel Firewall (WAF),
// not here: middleware runs *after* a request is already counted as a CDN
// request, so blocking bots here can't lower the CDN-request bill and would only
// add function invocations. The firewall denies unwanted traffic at the edge for
// free, before it reaches any function.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!req.cookies.get("asm_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/app/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/app/:path*"] };
