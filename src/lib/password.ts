import crypto from "node:crypto";
import { normalizePhone } from "@/lib/member";

/**
 * Deterministic member password: the last 8 hex chars of sha256(10-digit phone).
 * Hex → lowercase alphanumeric (0-9a-f), exactly 8 characters. Derived purely
 * from the phone, so the state admin can generate & share it; no storage needed.
 */
export function memberPassword(phone: string): string {
  const p = normalizePhone(phone);
  return crypto.createHash("sha256").update(p).digest("hex").slice(-8);
}

export function verifyMemberPassword(phone: string, pw: string): boolean {
  const expected = memberPassword(phone);
  const given = (pw || "").trim().toLowerCase();
  if (given.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
  } catch {
    return false;
  }
}
