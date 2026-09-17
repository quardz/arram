import { NextResponse } from "next/server";
import { getCurrentMember, isAdmin, normalizePhone } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { pincodeToGeoNode } from "@/lib/pincodeGeo";
import { getPayloadClient } from "@/lib/payload";
import { audit, auditActor } from "@/lib/audit";

const MAX_ROWS = 300;

/** 10-digit phone → 7-char uppercase base-36 referral code. */
function phoneToReferral(phone: string): string {
  const n = parseInt(phone.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n.toString(36).toUpperCase().padStart(7, "0") : "";
}

type InRow = { name?: string; phone?: string; pincode?: string };
type OutRow = { name: string; phone: string; status: "added" | "exists" | "invalid"; reason?: string };

// Bulk-add people. Admins only; each new person is referred by the adder
// (referredBy) and tagged source="member-added".
export async function POST(req: Request) {
  const member = await getCurrentMember();
  if (!member?.assignments.length) return NextResponse.json({ ok: false }, { status: 403 });
  if (!isAdmin(member)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const rows: InRow[] = Array.isArray(body?.rows) ? body.rows.slice(0, MAX_ROWS) : [];
  if (!rows.length) return NextResponse.json({ ok: false, error: "no_rows" }, { status: 400 });

  const payload = await getPayloadClient();
  const mine = await myDistrictIds(member);
  const fallbackDistrict = mine.length === 1 ? mine[0] : undefined;
  const adderId = member.person.id as number;

  const results: OutRow[] = [];
  for (const r of rows) {
    const name = String(r.name || "").trim();
    const phone = normalizePhone(String(r.phone || ""));
    const pincode = String(r.pincode || "").replace(/\D/g, "").slice(0, 6);

    if (!name || !/^[6-9]\d{9}$/.test(phone)) {
      results.push({ name, phone, status: "invalid", reason: "bad_name_or_phone" });
      continue;
    }
    if (pincode && !/^6\d{5}$/.test(pincode)) {
      results.push({ name, phone, status: "invalid", reason: "bad_pincode" });
      continue;
    }

    const existing = await payload.count({ collection: "people", overrideAccess: true, where: { phone: { equals: phone } } });
    if (existing.totalDocs) {
      results.push({ name, phone, status: "exists" });
      continue;
    }

    const geoNode = pincodeToGeoNode(pincode) ?? fallbackDistrict;
    try {
      await payload.create({
        collection: "people", overrideAccess: true,
        data: {
          phone, name, pincode: pincode || undefined,
          geoNode, referredBy: adderId, referralCode: phoneToReferral(phone),
          source: "member-added", otpVerified: false,
        } as unknown as { phone: string },
      });
      results.push({ name, phone, status: "added" });
    } catch {
      // most likely a unique-phone race — treat as existing
      results.push({ name, phone, status: "exists" });
    }
  }

  const added = results.filter((r) => r.status === "added").length;
  const ctx = await auditActor();
  if (ctx && added) await audit({ ...ctx, action: "quickadd_person", detail: `bulk-add ${added} people` });

  return NextResponse.json({
    ok: true, results,
    added,
    skipped: results.filter((r) => r.status === "exists").length,
    invalid: results.filter((r) => r.status === "invalid").length,
  });
}
