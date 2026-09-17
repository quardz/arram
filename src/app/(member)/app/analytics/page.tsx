import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { campaignStatus, campaignRollup, type CampaignRollup } from "@/lib/campaign";
import { getPayloadClient } from "@/lib/payload";
import type { Event } from "@/payload-types";
import AppBar from "../_components/AppBar";

export const dynamic = "force-dynamic";

type Ev = Event & { startAt?: string | null; endAt?: string | null; funnelParent?: unknown };
const rel = (v: unknown): number | undefined =>
  v == null ? undefined : typeof v === "object" ? (v as { id?: number }).id : (v as number);

export default async function AnalyticsPage() {
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
  let campaigns: Ev[] = [];
  const rollups = new Map<number, CampaignRollup>();
  if (area.length) {
    const sess = await payload.find({
      collection: "events", overrideAccess: true, depth: 0, limit: 5000,
      where: { and: [{ kind: { equals: "campaign_session" } }, { geoNode: { in: area } }] },
    });
    const parentIds = new Set<number>();
    for (const s of sess.docs) { const pid = rel((s as { parentEvent?: unknown }).parentEvent); if (pid != null) parentIds.add(pid); }
    if (parentIds.size) {
      const parents = await payload.find({
        collection: "events", overrideAccess: true, depth: 0, limit: 200, sort: "-startAt",
        where: { id: { in: [...parentIds] } },
      });
      campaigns = parents.docs as Ev[];
      for (const c of campaigns) rollups.set(c.id as number, await campaignRollup(payload, c as unknown as { id: number; startAt?: string | null; endAt?: string | null; funnelParent?: unknown }, area));
    }
  }

  const totalChecked = [...rollups.values()].reduce((n, r) => n + r.checked, 0);
  const totalEligible = [...rollups.values()].reduce((n, r) => n + r.eligible, 0);
  const overallPct = totalEligible ? Math.round((totalChecked / totalEligible) * 100) : 0;
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short" }) : "");

  // Campaigns sorted by completion rate (desc) for the bar list.
  const rows = campaigns.map((c) => {
    const r = rollups.get(c.id as number)!;
    return { id: c.id as number, name: c.name, status: campaignStatus(c), r, pct: r.eligible ? Math.round((r.checked / r.eligible) * 100) : 0, start: c.startAt, end: c.endAt };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={admin} userName={uname} userRole={urole} />
      <main className="asm-main">
        <div className="asm-hero"><h1>{tr(lang, "an_title")}</h1><p>{tr(lang, "an_sub")}</p></div>

        {campaigns.length === 0 ? (
          <div className="asm-empty"><div className="big">📈</div>{tr(lang, "an_no_data")}</div>
        ) : (
          <>
            <div className="asm-stats">
              <div className="asm-stat"><b>{campaigns.length}</b><small>{tr(lang, "an_total_campaigns")}</small></div>
              <div className="asm-stat"><b>{overallPct}%</b><small>{tr(lang, "an_overall_rate")}</small></div>
              <div className="asm-stat"><b>{totalChecked}</b><small>{tr(lang, "an_checked")}</small></div>
              <div className="asm-stat"><b>{totalEligible}</b><small>{tr(lang, "an_eligible")}</small></div>
            </div>

            <h2 className="asm-subhead">{tr(lang, "an_by_campaign")}</h2>
            <div className="cc-bars">
              {rows.map((row) => (
                <Link key={row.id} href={`/app/attendance/campaign/${row.id}`} className="cc-bar">
                  <span className="cc-bar-top">
                    <span className="cc-bar-name">{row.name}</span>
                    <span className="cc-bar-val">✓ {row.r.checked}/{row.r.eligible} · {row.pct}%</span>
                  </span>
                  <span className="cc-track"><span className="cc-fill" style={{ width: `${Math.max(2, row.pct)}%` }} /></span>
                  <span className="cc-bar-sub">
                    <span className={`cc-dot ${row.status}`}>{tr(lang, `att_status_${row.status}`)}</span>
                    <span className="cc-muted">{row.start ? `${fmt(row.start)} – ${fmt(row.end)}` : ""}</span>
                    <span className="cc-go" aria-hidden>›</span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
