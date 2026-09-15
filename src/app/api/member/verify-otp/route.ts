import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { findPersonByPhone, normalizePhone } from "@/lib/member";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(body?.phone || ""));
  const code = String(body?.code || "");
  if (!/^[6-9]\d{9}$/.test(phone) || !/^\d{6}$/.test(code))
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });

  const v = await verifyOtp(phone, code);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 401 });

  const person = await findPersonByPhone(phone);
  if (!person) return NextResponse.json({ ok: false, error: "not_member" }, { status: 403 });

  await setSessionCookie(await createSessionToken({ personId: person.id as number, phone }));
  return NextResponse.json({ ok: true });
}
