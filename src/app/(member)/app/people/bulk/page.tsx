import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import AppBar from "../../_components/AppBar";
import BulkAddPeople from "../../_components/BulkAddPeople";

export const dynamic = "force-dynamic";

export default async function BulkAddPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  if (!isAdmin(member)) redirect("/app/people"); // bulk add is admin-only
  const lang = await getLang();
  return (
    <>
      <AppBar lang={lang} backHref="/app/people" backLabel={tr(lang, "ppl_title")} loggedIn nav isAdmin={isAdmin(member)} />
      <main className="asm-main">
        <div className="asm-hero"><h1>{tr(lang, "ppl_bulk_add")}</h1><p>{tr(lang, "bulk_sub")}</p></div>
        <BulkAddPeople m={messages(lang)} />
      </main>
    </>
  );
}
