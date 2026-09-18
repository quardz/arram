import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { myDistrictIds, myNodeIds } from "@/lib/attendance";
import { campaignStatus, campaignRollup, type CampaignRollup } from "@/lib/campaign";
import { getPayloadClient } from "@/lib/payload";
import type { Event } from "@/payload-types";
import AppBar from "../_components/AppBar";
import DeleteEventButton from "../_components/DeleteEventButton";

export const dynamic = "force-dynamic";

type Ev = Event & { startAt?: string | null; endAt?: string | null; funnelParent?: unknown };
const rel = (v: unknown): number | undefined =>
  v == null ? undefined : typeof v === "object" ? (v as { id?: number }).id : (v as number);

export default async function AttendanceList() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  const admin = isAdmin(member);
  const primary = member.assignments[0];
  const pnode = typeof primary.geoNode === "object" ? (primary.geoNode as { name?: string }) : null;
  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const urole = `${tr(lang, `role_${primary.role}`)}${pnode?.name ? ` · ${pnode.name}` : ""}`;
  const payload = await getPayloadClient();

  const area = await myDistrictIds(member);
  const heldNodes = myNodeIds(member);
  const singleOwnDistrict = area.length === 1 && heldNodes.includes(area[0]) ? area[0] : null;

  // Campaigns that have at least one district session in the viewer's area.
  let campaigns: Ev[] = [];
  const rollups = new Map<number, CampaignRollup>();
  const ownSession = new Map<number, number>(); // campaignId -> the viewer's own district session id
  if (area.length) {
    const sess = await payload.find({
      collection: "events", overrideAccess: true, depth: 0, limit: 5000,
      where: { and: [{ kind: { equals: "campaign_session" } }, { geoNode: { in: area } }] },
    });
    const parentIds = new Set<number>();
    for (const s of sess.docs) {
      const pid = rel((s as { parentEvent?: unknown }).parentEvent);
      if (pid != null) {
        parentIds.add(pid);
        if (singleOwnDistrict != null && rel((s as { geoNode?: unknown }).geoNode) === singleOwnDistrict) ownSession.set(pid, s.id as number);
      }
    }
    if (parentIds.size) {
      const parents = await payload.find({
        collection: "events", overrideAccess: true, depth: 0, limit: 200, sort: "-startAt",
        where: { id: { in: [...parentIds] } },
      });
      campaigns = parents.docs as Ev[];
      for (const c of campaigns) rollups.set(c.id as number, await campaignRollup(payload, c as unknown as { id: number; startAt?: string | null; endAt?: string | null; funnelParent?: unknown }, area));
    }
  }

  // Admins keep the old local-event flow.
  const locals = admin && area.length
    ? await payload.find({
        collection: "events", overrideAccess: true, depth: 1, limit: 50, sort: "-date",
        where: { and: [{ geoNode: { in: area } }, { kind: { equals: "local" } }] },
      })
    : { docs: [] as Event[] };

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short" }) : "");
  const statusLabel = (ev: Ev) => {
    const s = campaignStatus(ev);
    if (s === "open") return { cls: "open", text: tr(lang, "att_status_open") };
    if (s === "upcoming") return { cls: "upcoming", text: `${tr(lang, "att_status_opens")} ${fmt(ev.startAt)}` };
    return { cls: "closed", text: `${tr(lang, "att_status_closed")} ${fmt(ev.endAt)}` };
  };

  const hasAny = campaigns.length > 0 || locals.docs.length > 0;

  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={admin} userName={uname} userRole={urole} />
      <main className="asm-main">
        <div className="asm-listhdr">
          <h1>{tr(lang, "att_title")}</h1>
        </div>
        {admin && (
          <div className="asm-actionrow">
            <Link href="/app/attendance/campaign/new" className="asm-add wide">＋ {tr(lang, "att_new_campaign")}</Link>
            <Link href="/app/attendance/new" className="asm-add ghost wide">＋ {tr(lang, "att_new_local")}</Link>
          </div>
        )}

        {!hasAny ? (
          <div className="asm-empty"><div className="big">🛕</div>{tr(lang, "att_no_campaigns")}</div>
        ) : (
          <ul className="asm-cards">
            {campaigns.map((ev) => {
              const id = ev.id as number;
              const r = rollups.get(id);
              const st = statusLabel(ev);
              const funnel = (ev as { funnelParent?: unknown }).funnelParent != null;
              const own = ownSession.get(id);
              const href = own != null ? `/app/attendance/${own}` : `/app/attendance/campaign/${id}`;
              const multi = singleOwnDistrict == null;
              return (
                <li key={`c${id}`}>
                  <Link href={href} className="asm-card">
                    <span className="asm-icn">{funnel ? "🎯" : "📢"}</span>
                    <span className="asm-cmeta">
                      <span className="top">
                        <b>{ev.name}</b>
                        <span className={`asm-badge ${st.cls}`}>{st.text}</span>
                      </span>
                      {r && (
                        <small className="asm-statline">
                          ✓ {r.checked}/{r.eligible} {tr(lang, "att_stat_checked")}
                          {multi ? ` · ${r.districtsStarted}/${r.districtsTotal} ${tr(lang, "att_stat_districts")}` : ""}
                        </small>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
            {(locals.docs as Event[]).map((ev) => {
              const node = typeof ev.geoNode === "object" ? (ev.geoNode as { name?: string }) : null;
              return (
                <li key={`l${ev.id}`} className={admin ? "att-row-wrap" : undefined}>
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
                  {admin && <DeleteEventButton eventId={ev.id as number} kind="local" variant="icon" m={messages(lang)} />}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
