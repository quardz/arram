import { tr, getLang } from "@/lib/i18n";
import AppBar from "../_components/AppBar";
import LogoutButton from "../_components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function NoAccess() {
  const lang = await getLang();
  return (
    <>
      <AppBar lang={lang} title={tr(lang, "appName")} />
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
