import { NextResponse } from "next/server";
import { getCurrentMember, isAdmin, normalizePhone } from "@/lib/member";
import { getPayloadClient } from "@/lib/payload";

// Update the current member's own profile. full_time is only applied when the
// caller is state_admin / super_admin (users can view it but not change it).
export async function POST(req: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const secondaryPhone = normalizePhone(String(body?.secondaryPhone || ""));
  const socialRaw = Array.isArray(body?.socialLinks) ? body.socialLinks : [];
  const socialLinks = socialRaw
    .map((s: { platform?: unknown; url?: unknown }) => ({
      platform: String(s?.platform || "").trim().slice(0, 40),
      url: String(s?.url || "").trim().slice(0, 300),
    }))
    .filter((s: { platform: string; url: string }) => s.platform || s.url)
    .slice(0, 20);
  if (!name) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false, error: "bad_email" }, { status: 400 });
  if (secondaryPhone && !/^[6-9]\d{9}$/.test(secondaryPhone)) return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 });

  const data: Record<string, unknown> = { name, email: email || null, secondaryPhone: secondaryPhone || null, socialLinks };
  if (typeof body?.fullTime === "boolean" && isAdmin(member)) data.fullTime = body.fullTime;

  const payload = await getPayloadClient();
  await (payload as unknown as { update: (a: unknown) => Promise<unknown> }).update({
    collection: "people", id: member.person.id, overrideAccess: true, data,
  });
  return NextResponse.json({ ok: true });
}
