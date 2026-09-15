import { redirect } from "next/navigation";
import { tr, getLang } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import AppBar from "../_components/AppBar";
import LogoutButton from "../_components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function NoAccess() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  const lang = await getLang();
  const name = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  return (
    <>
      <AppBar lang={lang} title={tr(lang, "appName")} loggedIn userName={name} />
      <main className="asm-main">
        <div className="asm-panel">
          <h1>{tr(lang, "noaccess_title")}</h1>
          <p>{tr(lang, "noaccess_body")}</p>
          <div className="asm-center"><LogoutButton label={tr(lang, "back_to_login")} /></div>
        </div>
      </main>
    </>
  );
}
