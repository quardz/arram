import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { getPayloadClient } from "@/lib/payload";
import type { Event, GeoNode } from "@/payload-types";

export const dynamic = "force-dynamic";

export default async function AttendanceList() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  const mine = await myDistrictIds(member);
  const payload = await getPayloadClient();
  const evs = mine.length
    ? await payload.find({
        collection: "events", overrideAccess: true, depth: 1, limit: 50, sort: "-date",
        where: { and: [{ geoNode: { in: mine } }, { kind: { in: ["local", "campaign_session"] } }] },
      })
    : { docs: [] as Event[] };
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN") : "");
  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/app" className="text-sm text-neutral-500">← {tr(lang, "appName")}</Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr(lang, "att_title")}</h1>
        <Link href="/app/attendance/new" className="rounded-xl bg-neutral-900 px-4 py-2 font-semibold text-white">+ {tr(lang, "att_new_local")}</Link>
      </div>
      {evs.docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center text-neutral-500">{tr(lang, "att_no_sessions")}</p>
      ) : (
        <ul className="space-y-3">
          {(evs.docs as Event[]).map((ev) => {
            const node = typeof ev.geoNode === "object" ? (ev.geoNode as GeoNode) : null;
            return (
              <li key={ev.id}>
                <Link href={`/app/attendance/${ev.id}`} className="block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm active:scale-[0.99]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{ev.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${ev.kind === "campaign_session" ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-600"}`}>
                      {tr(lang, ev.kind === "campaign_session" ? "att_campaign" : "att_local")}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">{node?.name}{ev.date ? ` · ${fmt(ev.date)}` : ""}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
