import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { getPayloadClient } from "@/lib/payload";
import type { Event, GeoNode } from "@/payload-types";
import AppBar from "../../../_components/AppBar";
import CampaignForm from "../../../_components/CampaignForm";

export const dynamic = "force-dynamic";

export default async function NewCampaign() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  if (!isAdmin(member)) redirect("/app/attendance");
  const lang = await getLang();
  const primary = member.assignments[0];
  const pnode = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const uname = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const urole = `${tr(lang, `role_${primary.role}`)}${pnode ? ` · ${pnode.name}` : ""}`;

  const payload = await getPayloadClient();
  const prev = await payload.find({
    collection: "events", overrideAccess: true, depth: 0, limit: 100, sort: "-startAt",
    where: { kind: { equals: "campaign_parent" } },
  });
  const campaigns = (prev.docs as Event[]).map((e) => ({ id: e.id as number, name: e.name }));

  return (
    <>
      <AppBar lang={lang} backHref="/app/attendance" backLabel={tr(lang, "att_title")} loggedIn nav isAdmin={isAdmin(member)} userName={uname} userRole={urole} />
      <main className="asm-main">
        <div className="asm-hero"><h1>{tr(lang, "cf_title")}</h1><p>{tr(lang, "cf_sub")}</p></div>
        <CampaignForm campaigns={campaigns} m={messages(lang)} />
      </main>
    </>
  );
}
