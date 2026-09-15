import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import { getAccessibleSession } from "@/lib/attendance";
import { getPayloadClient } from "@/lib/payload";
import type { GeoNode, Person } from "@/payload-types";
import PrintButton from "../../../_components/PrintButton";

export const dynamic = "force-dynamic";

const rel = (v: unknown) => (v && typeof v === "object" ? (v as { id?: number }).id : (v as number | undefined));

export default async function PrintAttendance({ params }: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const { id } = await params;
  const ev = await getAccessibleSession(member, Number(id));
  if (!ev) notFound();
  const lang = await getLang();
  const node = typeof ev.geoNode === "object" ? (ev.geoNode as GeoNode) : null;
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN") : "");

  const payload = await getPayloadClient();
  const at = await payload.find({
    collection: "attendance", overrideAccess: true, depth: 1, limit: 20000,
    where: { and: [{ event: { equals: ev.id } }, { present: { equals: true } }] },
  });
  const people = at.docs
    .map((a) => (typeof a.person === "object" ? (a.person as Person) : null))
    .filter((p): p is Person => !!p)
    .map((p) => ({ name: p.name && p.name !== "multiple" ? p.name : p.phone, phone: p.phone }))
    .sort((a, b) => a.name.localeCompare(b.name, lang === "ta" ? "ta" : "en"));

  return (
    <main className="asm-main print-wrap">
      <div className="print-toolbar">
        <Link href={`/app/attendance/${ev.id}`} className="asm-back" style={{ color: "var(--asm-brand)" }}>← {tr(lang, "att_title")}</Link>
        <PrintButton label={tr(lang, "print_btn")} />
      </div>

      <div className="print-sheet">
        <div className="print-head">
          <div className="print-om" aria-hidden>ॐ</div>
          <div>
            <div className="print-app">{tr(lang, "appName")}</div>
            <h1 className="print-title">{ev.name}</h1>
            <div className="print-meta">{node?.name}{ev.date ? ` · ${fmt(ev.date)}` : ""}</div>
          </div>
        </div>
        <div className="print-total">{tr(lang, "print_total")}: <b>{people.length}</b></div>
        <table className="print-table">
          <thead><tr><th>#</th><th>{tr(lang, "org_name")}</th><th>{tr(lang, "org_phone")}</th></tr></thead>
          <tbody>
            {people.map((p, i) => (
              <tr key={i}><td>{i + 1}</td><td>{p.name}</td><td>{p.phone}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="print-foot">{tr(lang, "print_generated")}: {new Date().toLocaleString(lang === "ta" ? "ta-IN" : "en-IN")}</div>
      </div>
    </main>
  );
}
