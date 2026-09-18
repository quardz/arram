import { notFound, redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { myDistrictIds, myNodeIds } from "@/lib/attendance";
import { campaignStatus, campaignDistrictStats } from "@/lib/campaign";
import { getPayloadClient } from "@/lib/payload";
import type { Event, GeoNode } from "@/payload-types";
import AppBar from "../../../_components/AppBar";
import CampaignCharts from "../../../_components/CampaignCharts";
import DeleteEventButton from "../../../_components/DeleteEventButton";

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

  // Geo tree for the drill-down chart (state → region → mandalam → district).
  const nodesR = await payload.find({ collection: "geoNodes", overrideAccess: true, depth: 0, limit: 5000 });
  const chartNodes = (nodesR.docs as GeoNode[]).map((n) => ({
    id: n.id as number, name: n.name, nameTamil: n.nameTamil ?? null,
    level: (n.level as string) ?? "",
    parentId: n.parent == null ? null : (typeof n.parent === "object" ? ((n.parent as { id?: number }).id ?? null) : (n.parent as number)),
  }));
  const heldNodeIds = myNodeIds(member);
  const startNodeId = heldNodeIds[0] ?? null;

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

        <h2 className="asm-subhead">{tr(lang, "cst_by_level")}</h2>
        <CampaignCharts stats={stats} nodes={chartNodes} startNodeId={startNodeId} heldNodeIds={heldNodeIds} admin={admin} lang={lang} m={messages(lang)} />

        {admin && <DeleteEventButton eventId={campaign.id as number} kind="campaign_parent" redirectTo="/app/attendance" m={messages(lang)} />}
      </main>
    </>
  );
}
