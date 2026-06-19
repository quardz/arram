// Frontend-only helpers for the Join / referral flow.
// No backend yet — auth and the member registry live in localStorage,
// the referral code lives in a cookie. Swap these for API calls later.

export const REFERRAL_COOKIE = "asm_referral";
const AUTH_KEY = "asm_auth";
const MEMBERS_KEY = "asm_members";

/* ----------------------------- Referral codec ----------------------------- */

/**
 * Encode a 10-digit phone number into a 7-char uppercase base-36 referral code.
 * (36^7 > 9,999,999,999 ≥ any 10-digit number, so 7 chars always suffice.)
 */
export function phoneToReferral(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return "";
  return n.toString(36).toUpperCase().padStart(7, "0");
}

/** Decode a referral code back into the original 10-digit phone number. */
export function referralToPhone(code: string): string {
  const n = parseInt(code.trim(), 36);
  if (!Number.isFinite(n)) return "";
  return String(n).padStart(10, "0");
}

/* ------------------------------- Validation ------------------------------- */

/** Indian mobile number: exactly 10 digits, starting 6-9. */
export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));
}

/** Tamil Nadu PIN code: 6 digits, starting with 6. */
export function isValidTNPincode(pin: string): boolean {
  return /^6\d{5}$/.test(pin.replace(/\D/g, ""));
}

/** A referral code is well-formed if it is 7 alphanumeric chars. */
export function isValidReferralCode(code: string): boolean {
  return /^[0-9A-Z]{7}$/.test(code.trim().toUpperCase());
}

/* -------------------------------- Cookies --------------------------------- */

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/* ------------------------------ Member store ------------------------------ */

export type Member = {
  name: string;
  phone: string;
  referralCode: string; // this member's own code
  referredBy: string | null; // referral code they joined with
  pincode: string;
  dob?: string;
  gender?: "Male" | "Female" | "";
  createdAt: string;
};

export function getMembers(): Member[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MEMBERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function upsertMember(member: Member) {
  if (typeof localStorage === "undefined") return;
  const members = getMembers().filter((m) => m.phone !== member.phone);
  members.push(member);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

/** Direct referrals of a code, each annotated with how many they referred. */
export function getReferralTree(code: string): { member: Member; referredCount: number }[] {
  const members = getMembers();
  return members
    .filter((m) => m.referredBy === code)
    .map((member) => ({
      member,
      referredCount: members.filter((x) => x.referredBy === member.referralCode)
        .length,
    }));
}

/* --------------------------------- Auth ----------------------------------- */

export type AuthUser = { name: string; phone: string; referralCode: string };

export function getAuth(): AuthUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(user: AuthUser) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

/** Clear authentication only — the referral cookie is intentionally kept. */
export function clearAuth() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

/** A throwaway 6-digit OTP for the demo flow. */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
