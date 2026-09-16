import { NextResponse } from "next/server";
import type { Where } from "payload";
import { getCurrentMember } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { getPayloadClient } from "@/lib/payload";
import type { Person } from "@/payload-types";

// People directory, scoped to the member's assigned district(s). Paginated.
export async function GET(req: Request) {
  const member = await getCurrentMember();
  if (!member?.assignments.length) return NextResponse.json({ ok: false }, { status: 403 });
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const mine = await myDistrictIds(member);
  if (!mine.length) return NextResponse.json({ ok: true, people: [], hasMore: false, page });
  const payload = await getPayloadClient();
  const base: Where = { geoNode: { in: mine } };
  const where: Where = q ? { and: [base, { or: [{ name: { like: q } }, { phone: { like: q } }] }] } : base;
  const r = await payload.find({ collection: "people", overrideAccess: true, depth: 0, limit: 30, page, sort: "name", where });
  const people = (r.docs as Person[]).map((p) => ({
    id: p.id as number, name: p.name && p.name !== "multiple" ? p.name : p.phone, phone: p.phone,
    source: (p as { source?: string }).source ?? null,
  }));
  return NextResponse.json({ ok: true, people, hasMore: !!r.hasNextPage, page });
}
