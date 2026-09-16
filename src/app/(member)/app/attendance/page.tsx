import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { myDistrictIds, myNodeIds } from "@/lib/attendance";
import { campaignStatus } from "@/lib/campaign";
import { getPayloadClient } from "@/lib/payload";
import type { Event, GeoNode } from "@/payload-types";
import AppBar from "../_components/AppBar";

export const dynamic = "force-dynamic";

type Ev = Event & { startAt?: string | null; endAt?: string | null; funnelParent?: unknown };

export default async function AttendanceList() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  const admin = isAdmin(member);
  const primary = member.assignments[0];
  const pnode = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const urole = `${tr(lang, `role_${primary.role}`)}${pnode ? ` · ${pnode.name}` : ""}`;
  const payload = await getPayloadClient();

  // Campaign sessions this member holds (exact node they are the office-holder of).
  const nodes = myNodeIds(member);
  const camps = nodes.length
    ? await payload.find({
        collection: "events", overrideAccess: true, depth: 1, limit: 100, sort: "-startAt",
        where: { and: [{ kind: { equals: "campaign_session" } }, { geoNode: { in: nodes } }] },
      })
    : { docs: [] as Event[] };

  // Admins also keep the old local-event flow; members no longer see it.
  const mine = admin ? await myDistrictIds(member) : [];
  const locals = admin && mine.length
    ? await payload.find({
        collection: "events", overrideAccess: true, depth: 1, limit: 50, sort: "-date",
        where: { and: [{ geoNode: { in: mine } }, { kind: { equals: "local" } }] },
      })
    : { docs: [] as Event[] };

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short" }) : "");
  const statusLabel = (ev: Ev) => {
    const s = campaignStatus(ev);
    if (s === "open") return { cls: "open", text: tr(lang, "att_status_open") };
    if (s === "upcoming") return { cls: "upcoming", text: `${tr(lang, "att_status_opens")} ${fmt(ev.startAt)}` };
    return { cls: "closed", text: `${tr(lang, "att_status_closed")} ${fmt(ev.endAt)}` };
  };

  const hasAny = camps.docs.length > 0 || locals.docs.length > 0;

  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={admin} userName={uname} userRole={urole} />
      <main className="asm-main">
        <div className="asm-listhdr">
          <h1>{tr(lang, "att_title")}</h1>
          {admin && (
            <span style={{ display: "flex", gap: 8 }}>
              <Link href="/app/attendance/campaign/new" className="asm-add">＋ {tr(lang, "att_new_campaign")}</Link>
              <Link href="/app/attendance/new" className="asm-add ghost">＋ {tr(lang, "att_new_local")}</Link>
            </span>
          )}
        </div>

        {!hasAny ? (
          <div className="asm-empty"><div className="big">🛕</div>{tr(lang, "att_no_campaigns")}</div>
        ) : (
          <ul className="asm-cards">
            {(camps.docs as Ev[]).map((ev) => {
              const node = typeof ev.geoNode === "object" ? (ev.geoNode as GeoNode) : null;
              const st = statusLabel(ev);
              const funnel = (ev as { funnelParent?: unknown }).funnelParent != null;
              return (
                <li key={`c${ev.id}`}>
                  <Link href={`/app/attendance/${ev.id}`} className="asm-card">
                    <span className="asm-icn">{funnel ? "🎯" : "📢"}</span>
                    <span className="asm-cmeta">
                      <span className="top">
                        <b>{ev.name}</b>
                        <span className={`asm-badge ${st.cls}`}>{st.text}</span>
                      </span>
                      <small>{node?.name}{ev.startAt ? ` · ${fmt(ev.startAt)}–${fmt(ev.endAt)}` : ""}</small>
                    </span>
                  </Link>
                </li>
              );
            })}
            {(locals.docs as Event[]).map((ev) => {
              const node = typeof ev.geoNode === "object" ? (ev.geoNode as GeoNode) : null;
              return (
                <li key={`l${ev.id}`}>
                  <Link href={`/app/attendance/${ev.id}`} className="asm-card">
                    <span className="asm-icn">🛕</span>
                    <span className="asm-cmeta">
                      <span className="top">
                        <b>{ev.name}</b>
                        <span className="asm-badge local">{tr(lang, "att_local")}</span>
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
