import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import AppBar from "../_components/AppBar";
import PeopleDirectory from "../_components/PeopleDirectory";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={isAdmin(member)} />
      <main className="asm-main">
        <div className="asm-hero"><h1>{tr(lang, "ppl_title")}</h1></div>
        <PeopleDirectory m={messages(lang)} />
      </main>
    </>
  );
}
