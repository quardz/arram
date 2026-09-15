import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isStateAdmin } from "@/lib/member";
import { requireAdminActor } from "@/lib/impersonate";
import AppBar from "../_components/AppBar";
import ActivityView from "../_components/ActivityView";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  const lang = await getLang();
  const admin = (await requireAdminActor()) != null; // real actor is state_admin
  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={isStateAdmin(member)} />
      <main className="asm-main">
        <div className="asm-hero"><h1>{tr(lang, "act_title")}</h1></div>
        <ActivityView isAdmin={admin} m={messages(lang)} />
      </main>
    </>
  );
}
