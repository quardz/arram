import { notFound, redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { getAccessibleSession, canTakeSession } from "@/lib/attendance";
import { campaignStatus } from "@/lib/campaign";
import type { GeoNode } from "@/payload-types";
import AppBar from "../../_components/AppBar";
import AttendanceMarker from "../../_components/AttendanceMarker";

export const dynamic = "force-dynamic";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const { id } = await params;
  const ev = await getAccessibleSession(member, Number(id));
  if (!ev) notFound();
  const lang = await getLang();
  const primary = member.assignments[0];
  const pnode = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const urole = `${tr(lang, `role_${primary.role}`)}${pnode ? ` · ${pnode.name}` : ""}`;
  const node = typeof ev.geoNode === "object" ? (ev.geoNode as GeoNode) : null;
  const evx = ev as typeof ev & { startAt?: string | null; endAt?: string | null; funnelParent?: unknown };

  const isCampaign = (ev.kind as string) === "campaign_session";
  const status = isCampaign ? campaignStatus(evx) : "open";
  const open = status === "open";
  const funnel = evx.funnelParent != null;
  // Only the district office-holder marks; everyone else (admins, higher levels,
  // read-only) sees the roster read-only.
  const canTake = await canTakeSession(member, ev);
  const readOnly = !canTake;
  const canAdd = open && !funnel && canTake && isAdmin(member); // quick-add stays admin-gated

  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <>
      <AppBar lang={lang} backHref="/app/attendance" backLabel={tr(lang, "att_title")} loggedIn nav isAdmin={isAdmin(member)} userName={uname} userRole={urole} />
      <main className="asm-main">
        <div className="asm-hero">
          <h1>{ev.name}</h1>
          <p>{node?.name}{isCampaign && evx.startAt ? ` · ${fmt(evx.startAt)} – ${fmt(evx.endAt)}` : evx.date ? ` · ${fmt(evx.date)}` : ""}</p>
        </div>
        {isCampaign && status === "closed" && (
          <p className="asm-banner closed">🔒 {tr(lang, "att_closed_banner")}</p>
        )}
        {isCampaign && status === "upcoming" && (
          <p className="asm-banner upcoming">⏳ {tr(lang, "att_upcoming_banner")}</p>
        )}
        {funnel && (
          <p className="asm-banner funnel">🎯 {tr(lang, "att_funnel_note")}</p>
        )}
        <AttendanceMarker eventId={ev.id as number} m={messages(lang)} open={open} canAdd={canAdd} readOnly={readOnly} />
      </main>
    </>
  );
}
