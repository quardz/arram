import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import { getAccessibleSession } from "@/lib/attendance";
import type { GeoNode } from "@/payload-types";
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
    <main className="space-y-4">
      <Link href="/app/attendance" className="text-sm text-neutral-500">← {tr(lang, "att_title")}</Link>
      <div>
        <h1 className="text-2xl font-bold">{ev.name}</h1>
        <p className="text-sm text-neutral-500">{node?.name}{ev.date ? ` · ${fmt(ev.date)}` : ""}</p>
      </div>
      <AttendanceMarker eventId={ev.id as number} m={messages(lang)} />
    </main>
  );
}
