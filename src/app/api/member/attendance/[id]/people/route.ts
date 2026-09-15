import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/member";
import { getAccessibleSession, searchAttendees } from "@/lib/attendance";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member?.assignments.length) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await ctx.params;
  const ev = await getAccessibleSession(member, Number(id));
  if (!ev) return NextResponse.json({ ok: false, error: "no_access" }, { status: 403 });
  const q = new URL(req.url).searchParams.get("q") || "";
  return NextResponse.json({ ok: true, people: await searchAttendees(ev, q) });
}
