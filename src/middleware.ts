import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/app/login", "/app/no-access"];

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
