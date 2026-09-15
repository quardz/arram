import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/member";
import { getAccessibleSession, listAttendees } from "@/lib/attendance";

// Returns EVERY person in the session's district (with present state).
// The client loads this once and filters locally.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member?.assignments.length) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await ctx.params;
  const ev = await getAccessibleSession(member, Number(id));
  if (!ev) return NextResponse.json({ ok: false, error: "no_access" }, { status: 403 });
  return NextResponse.json({ ok: true, people: await listAttendees(ev, member) });
}
