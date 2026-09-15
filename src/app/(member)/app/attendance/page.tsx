import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember, isStateAdmin } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { getPayloadClient } from "@/lib/payload";
import type { Event, GeoNode } from "@/payload-types";
import AppBar from "../_components/AppBar";

export const dynamic = "force-dynamic";

export default async function AttendanceList() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  const primary = member.assignments[0];
  const pnode = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const urole = `${tr(lang, `role_${primary.role}`)}${pnode ? ` · ${pnode.name}` : ""}`;
  const mine = await myDistrictIds(member);
  const payload = await getPayloadClient();
  const evs = mine.length
    ? await payload.find({
        collection: "events", overrideAccess: true, depth: 1, limit: 50, sort: "-date",
        where: { and: [{ geoNode: { in: mine } }, { kind: { in: ["local", "campaign_session"] } }] },
      })
    : { docs: [] as Event[] };
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN") : "");
  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={isStateAdmin(member)} userName={uname} userRole={urole} />
      <main className="asm-main">
        <div className="asm-listhdr">
          <h1>{tr(lang, "att_title")}</h1>
          <Link href="/app/attendance/new" className="asm-add">＋ {tr(lang, "att_new_local")}</Link>
        </div>
        {evs.docs.length === 0 ? (
          <div className="asm-empty"><div className="big">🛕</div>{tr(lang, "att_no_sessions")}</div>
        ) : (
          <ul className="asm-cards">
            {(evs.docs as Event[]).map((ev) => {
              const node = typeof ev.geoNode === "object" ? (ev.geoNode as GeoNode) : null;
              const campaign = ev.kind === "campaign_session";
              return (
                <li key={ev.id}>
                  <Link href={`/app/attendance/${ev.id}`} className="asm-card">
                    <span className="asm-icn">{campaign ? "📢" : "🛕"}</span>
                    <span className="asm-cmeta">
                      <span className="top">
                        <b>{ev.name}</b>
                        <span className={`asm-badge ${campaign ? "campaign" : "local"}`}>
                          {tr(lang, campaign ? "att_campaign" : "att_local")}
                        </span>
                      </span>
                      <small>{node?.name}{ev.date ? ` · ${fmt(ev.date)}` : ""}</small>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
