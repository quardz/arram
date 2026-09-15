import { notFound, redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import { getAccessibleSession } from "@/lib/attendance";
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
  const node = typeof ev.geoNode === "object" ? (ev.geoNode as GeoNode) : null;
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN") : "");
  return (
    <>
      <AppBar lang={lang} backHref="/app/attendance" backLabel={tr(lang, "att_title")} />
      <main className="asm-main">
        <div className="asm-hero">
          <h1>{ev.name}</h1>
          <p>{node?.name}{ev.date ? ` · ${fmt(ev.date)}` : ""}</p>
        </div>
        <AttendanceMarker eventId={ev.id as number} m={messages(lang)} />
      </main>
    </>
  );
}
