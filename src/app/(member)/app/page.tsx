import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { campaignStatus, campaignRollup, type CampaignRollup } from "@/lib/campaign";
import { getPayloadClient } from "@/lib/payload";
import type { Event, GeoNode } from "@/payload-types";
import AppBar from "./_components/AppBar";

export const dynamic = "force-dynamic";

type Ev = Event & { startAt?: string | null; endAt?: string | null; funnelParent?: unknown };
const rel = (v: unknown): number | undefined =>
  v == null ? undefined : typeof v === "object" ? (v as { id?: number }).id : (v as number);

export default async function MemberHome() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");

  const lang = await getLang();
  const primary = member.assignments[0];
  const node = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const name = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const role = `${tr(lang, `role_${primary.role}`)}${node ? ` · ${node.name}` : ""}`;
  const payload = await getPayloadClient();

  // Currently-open campaigns within the viewer's area. Everyone taps through to
  // the campaign progress page (district members take attendance from there).
  const area = await myDistrictIds(member);
  let open: Ev[] = [];
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
      open = (parents.docs as Ev[]).filter((c) => campaignStatus(c) === "open");
      for (const c of open) rollups.set(c.id as number, await campaignRollup(payload, c as unknown as { id: number; startAt?: string | null; endAt?: string | null; funnelParent?: unknown }, area));
    }
  }

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short" }) : "");

  return (
    <>
      <AppBar lang={lang} title={tr(lang, "appName")} loggedIn nav isAdmin={isAdmin(member)} userName={name} userRole={role} />
      <main className="asm-main">
        <div className="asm-listhdr"><h1>{tr(lang, "home_campaigns")}</h1></div>
        {open.length === 0 ? (
          <div className="asm-empty"><div className="big">📢</div>{tr(lang, "home_no_campaigns")}</div>
        ) : (
          <ul className="asm-cards">
            {open.map((ev) => {
              const id = ev.id as number;
              const r = rollups.get(id);
              const funnel = (ev as { funnelParent?: unknown }).funnelParent != null;
              return (
                <li key={id}>
                  <Link href={`/app/attendance/campaign/${id}`} className="asm-card">
                    <span className="asm-icn">{funnel ? "🎯" : "📢"}</span>
                    <span className="asm-cmeta">
                      <span className="top">
                        <b>{ev.name}</b>
                        <span className="asm-badge open">{tr(lang, "att_status_open")}</span>
                      </span>
                      <small className="asm-statline">
                        {r ? `✓ ${r.checked}/${r.eligible} ${tr(lang, "att_stat_checked")} · ${r.districtsStarted}/${r.districtsTotal} ${tr(lang, "att_stat_districts")}` : ""}
                        {ev.startAt ? ` · ${fmt(ev.startAt)}–${fmt(ev.endAt)}` : ""}
                      </small>
                    </span>
                    <span className="asm-chev">›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Link href="/app/analytics" className="asm-card" style={{ fontSize: 17, fontWeight: 700, marginTop: 14 }}>
          <span className="asm-icn">📈</span>
          <span className="asm-cmeta"><b>{tr(lang, "an_title")}</b></span>
          <span aria-hidden style={{ color: "var(--asm-brand)", fontSize: 22 }}>→</span>
        </Link>
      </main>
    </>
  );
}
