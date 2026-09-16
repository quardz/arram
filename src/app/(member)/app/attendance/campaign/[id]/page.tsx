import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { myDistrictIds, myNodeIds } from "@/lib/attendance";
import { campaignStatus, campaignDistrictStats } from "@/lib/campaign";
import { getPayloadClient } from "@/lib/payload";
import type { Event } from "@/payload-types";
import AppBar from "../../../_components/AppBar";

export const dynamic = "force-dynamic";

type Ev = Event & { startAt?: string | null; endAt?: string | null; funnelParent?: unknown };

export default async function CampaignStatus({ params }: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const { id } = await params;
  const lang = await getLang();
  const admin = isAdmin(member);
  const payload = await getPayloadClient();

  const campaign = (await payload
    .findByID({ collection: "events", id: Number(id), overrideAccess: true, depth: 0 })
    .catch(() => null)) as Ev | null;
  if (!campaign || (campaign.kind as string) !== "campaign_parent") notFound();

  const area = await myDistrictIds(member);
  const stats = await campaignDistrictStats(payload, campaign as unknown as { id: number; startAt?: string | null; endAt?: string | null; funnelParent?: unknown }, area);
  if (!stats.length) notFound();

  const held = new Set(myNodeIds(member));
  const primary = member.assignments[0];
  const pnode = typeof primary.geoNode === "object" ? (primary.geoNode as { name?: string }) : null;
  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const urole = `${tr(lang, `role_${primary.role}`)}${pnode?.name ? ` · ${pnode.name}` : ""}`;

  const eligible = stats.reduce((n, s) => n + s.eligible, 0);
  const checked = stats.reduce((n, s) => n + s.checked, 0);
  const districtsStarted = stats.filter((s) => s.started).length;
  const pct = eligible ? Math.round((checked / eligible) * 100) : 0;
  const status = campaignStatus(campaign);
  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <>
      <AppBar lang={lang} backHref="/app/attendance" backLabel={tr(lang, "att_title")} loggedIn nav isAdmin={admin} userName={uname} userRole={urole} />
      <main className="asm-main">
        <div className="asm-hero">
          <h1>{campaign.name}</h1>
          <p>{campaign.startAt ? `${fmt(campaign.startAt)} – ${fmt(campaign.endAt)}` : ""} · <span className={`asm-badge ${status}`}>{tr(lang, `att_status_${status}`)}</span></p>
        </div>

        <div className="asm-stats">
          <div className="asm-stat"><b>{checked}</b><small>{tr(lang, "cst_checked")}</small></div>
          <div className="asm-stat"><b>{eligible}</b><small>{tr(lang, "cst_eligible")}</small></div>
          <div className="asm-stat"><b>{pct}%</b><small>{tr(lang, "cst_rate")}</small></div>
          <div className="asm-stat"><b>{districtsStarted}/{stats.length}</b><small>{tr(lang, "cst_districts_started")}</small></div>
        </div>

        <h2 className="asm-subhead">{tr(lang, "cst_breakdown")}</h2>
        <ul className="asm-cards">
          {stats.map((s) => {
            const takeable = admin || held.has(s.districtId);
            const dpct = s.eligible ? Math.round((s.checked / s.eligible) * 100) : 0;
            const inner = (
              <>
                <span className="asm-cmeta">
                  <span className="top">
                    <b>{s.name}</b>
                    <span className={`asm-badge ${s.started ? "open" : "closed"}`}>{tr(lang, s.started ? "att_status_open" : "att_status_closed")}</span>
                  </span>
                  <small className="asm-statline">✓ {s.checked}/{s.eligible} · {dpct}%</small>
                </span>
                {takeable && <span className="asm-chev">›</span>}
              </>
            );
            return (
              <li key={s.districtId}>
                {takeable
                  ? <Link href={`/app/attendance/${s.sessionId}`} className="asm-card">{inner}</Link>
                  : <div className="asm-card asm-card-static">{inner}</div>}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
