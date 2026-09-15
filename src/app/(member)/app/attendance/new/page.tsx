import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { getPayloadClient } from "@/lib/payload";
import type { GeoNode } from "@/payload-types";
import NewLocalForm from "../../_components/NewLocalForm";

export const dynamic = "force-dynamic";

export default async function NewLocal() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  const mine = await myDistrictIds(member);
  const payload = await getPayloadClient();
  const nodes = mine.length
    ? await payload.find({ collection: "geoNodes", overrideAccess: true, depth: 0, limit: 500, sort: "name", where: { id: { in: mine } } })
    : { docs: [] as GeoNode[] };
  const districts = (nodes.docs as GeoNode[]).map((n) => ({ id: n.id as number, name: n.name }));
  return (
    <main className="space-y-4">
      <Link href="/app/attendance" className="text-sm text-neutral-500">← {tr(lang, "att_title")}</Link>
      <h1 className="text-2xl font-bold">{tr(lang, "att_new_local")}</h1>
      <NewLocalForm districts={districts} m={messages(lang)} />
    </main>
  );
}
