import { tr, getLang } from "@/lib/i18n";
import LangToggle from "../_components/LangToggle";
import LogoutButton from "../_components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function NoAccess() {
  const lang = await getLang();
  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-500">{tr(lang, "appName")}</span>
        <LangToggle lang={lang} />
      </div>
      <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <h1 className="text-xl font-bold">{tr(lang, "noaccess_title")}</h1>
        <p className="mt-2 text-neutral-600">{tr(lang, "noaccess_body")}</p>
        <div className="mt-6"><LogoutButton label={tr(lang, "back_to_login")} /></div>
      </div>
    </main>
  );
}
