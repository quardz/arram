import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { getPayloadClient } from "@/lib/payload";
import type { GeoNode } from "@/payload-types";
import type { Where } from "payload";
import AppBar from "../_components/AppBar";

export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  if (!isAdmin(member)) redirect("/app");
  const lang = await getLang();
  const payload = await getPayloadClient();

  const count = async (where?: Where): Promise<number | null> => {
    try {
      return (await payload.count({ collection: "people", overrideAccess: true, ...(where ? { where } : {}) })).totalDocs;
    } catch {
      return null;
    }
  };

  const total = await count();
  const withPincode = await count({ pincode: { not_equals: "" } });
  const withDistrict = await count({ geoNode: { exists: true } });
  const withUnion = await count({ "rawGeoText.union": { not_equals: "" } } as unknown as Where);
  const pinNoDistrict = await count({ and: [{ pincode: { not_equals: "" } }, { geoNode: { exists: false } }] });
  const noPincode = total != null && withPincode != null ? total - withPincode : null;

  // people per AAS district (sequential counts — fine for an occasional admin view)
  const dz = await payload.find({
    collection: "geoNodes", overrideAccess: true, depth: 0, limit: 5000,
    where: { level: { equals: "district" } }, sort: "name",
  });
  const districts: { name: string; count: number }[] = [];
  for (const d of dz.docs as GeoNode[]) {
    districts.push({ name: d.name, count: (await count({ geoNode: { equals: d.id } })) ?? 0 });
  }
  districts.sort((a, b) => b.count - a.count);

  const pct = (n: number | null) => (total && n != null ? Math.round((100 * n) / total) : null);
  const val = (n: number | null) => (n == null ? "—" : n.toLocaleString(lang === "ta" ? "ta-IN" : "en-IN"));
  const pv = (n: number | null) => { const p = pct(n); return p == null ? "" : ` · ${p}%`; };

  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;

  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin userName={uname} />
      <main className="asm-main">
        <div className="asm-hero"><h1>{tr(lang, "cov_title")}</h1><p>{tr(lang, "cov_sub")}</p></div>

        <div className="asm-stats">
          <div className="asm-stat"><b>{val(total)}</b><small>{tr(lang, "cov_total")}</small></div>
          <div className="asm-stat"><b>{val(withPincode)}</b><small>{tr(lang, "cov_with_pincode")}{pv(withPincode)}</small></div>
          <div className="asm-stat"><b>{val(withDistrict)}</b><small>{tr(lang, "cov_with_district")}{pv(withDistrict)}</small></div>
          <div className="asm-stat"><b>{val(withUnion)}</b><small>{tr(lang, "cov_with_union")}{pv(withUnion)}</small></div>
        </div>

        <p className="asm-banner funnel" style={{ marginTop: 4 }}>
          ⚠ {val(pinNoDistrict)} {tr(lang, "cov_pin_no_district")} · {val(noPincode)} {tr(lang, "cov_no_pincode")}
        </p>

        <h2 className="asm-subhead">{tr(lang, "cov_by_district")}</h2>
        <ul className="asm-people">
          {districts.map((d, i) => (
            <li key={i} className="asm-person">
              <span className="asm-pnm"><b>{d.name}</b></span>
              <span className="asm-badge open">{d.count.toLocaleString(lang === "ta" ? "ta-IN" : "en-IN")}</span>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
