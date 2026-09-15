import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import LangToggle from "../_components/LangToggle";
import LoginForm from "../_components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const member = await getCurrentMember();
  if (member && member.assignments.length) redirect("/app");
  const lang = await getLang();
  return (
    <main>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-500">{tr(lang, "appName")}</span>
        <LangToggle lang={lang} />
      </div>
      <h1 className="mt-8 text-2xl font-bold">{tr(lang, "login_title")}</h1>
      <p className="mt-1 text-neutral-600">{tr(lang, "login_sub")}</p>
      <LoginForm m={messages(lang)} />
    </main>
  );
}
