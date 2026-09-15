import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isStateAdmin } from "@/lib/member";
import { myDistrictIds } from "@/lib/attendance";
import { getPayloadClient } from "@/lib/payload";
import type { GeoNode } from "@/payload-types";
import AppBar from "../../_components/AppBar";
import NewLocalForm from "../../_components/NewLocalForm";

export const dynamic = "force-dynamic";

export default async function NewLocal() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  const primary = member.assignments[0];
  const pnode = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const urole = `${tr(lang, `role_${primary.role}`)}${pnode ? ` · ${pnode.name}` : ""}`;
  const mine = await myDistrictIds(member);
  const payload = await getPayloadClient();
  const nodes = mine.length
    ? await payload.find({ collection: "geoNodes", overrideAccess: true, depth: 0, limit: 500, sort: "name", where: { id: { in: mine } } })
    : { docs: [] as GeoNode[] };
  const districts = (nodes.docs as GeoNode[]).map((n) => ({ id: n.id as number, name: n.name }));
  return (
    <>
      <AppBar lang={lang} backHref="/app/attendance" backLabel={tr(lang, "att_title")} loggedIn nav isAdmin={isStateAdmin(member)} userName={uname} userRole={urole} />
      <main className="asm-main">
        <div className="asm-hero"><h1>{tr(lang, "att_new_local")}</h1></div>
        <NewLocalForm districts={districts} m={messages(lang)} />
      </main>
    </>
  );
}
