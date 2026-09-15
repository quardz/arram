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
  const primary = member.assignments[0];
  const pnode = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const urole = `${tr(lang, `role_${primary.role}`)}${pnode ? ` · ${pnode.name}` : ""}`;
  const node = typeof ev.geoNode === "object" ? (ev.geoNode as GeoNode) : null;
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN") : "");
  return (
    <>
      <AppBar lang={lang} backHref="/app/attendance" backLabel={tr(lang, "att_title")} loggedIn nav userName={uname} userRole={urole} />
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
