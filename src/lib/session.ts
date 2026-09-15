import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env, SESSION_SECONDS } from "@/lib/env";

export const SESSION_COOKIE = "asm_session";
const secret = new TextEncoder().encode(env.PAYLOAD_SECRET || "dev-secret-change-me");

export type Session = { personId: number; phone: string };

export async function createSessionToken(s: Session): Promise<string> {
  return new SignJWT({ phone: s.phone })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(s.personId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secret);
}

export async function readSessionToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const personId = Number(payload.sub);
    if (!personId) return null;
    return { personId, phone: String(payload.phone || "") };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  return readSessionToken(c.get(SESSION_COOKIE)?.value);
}
