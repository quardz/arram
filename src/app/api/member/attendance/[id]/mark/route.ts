import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/member";
import { getAccessibleSession, markAttendance } from "@/lib/attendance";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member?.assignments.length) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await ctx.params;
  const ev = await getAccessibleSession(member, Number(id));
  if (!ev) return NextResponse.json({ ok: false, error: "no_access" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const personId = Number(body?.personId); const present = Boolean(body?.present);
  if (!personId) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  await markAttendance(ev, personId, present, member.person.id as number);
  return NextResponse.json({ ok: true });
}
