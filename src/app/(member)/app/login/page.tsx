import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import AppBar from "../_components/AppBar";
import LoginForm from "../_components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const member = await getCurrentMember();
  if (member && member.assignments.length) redirect("/app");
  const lang = await getLang();
  return (
    <>
      <AppBar lang={lang} title={tr(lang, "appName")} />
      <main className="asm-main">
        <div className="asm-hero">
          <h1>{tr(lang, "login_title")}</h1>
          <p>{tr(lang, "login_sub")}</p>
        </div>
        <LoginForm m={messages(lang)} />
      </main>
    </>
  );
}
