import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";
import { audit, auditActor } from "@/lib/audit";

export async function POST() {
  const ctx = await auditActor();
  if (ctx) await audit({ ...ctx, action: "logout" });
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
