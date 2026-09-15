import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { requireAdminActor } from "@/lib/impersonate";
import { getCurrentMember, isStateAdmin } from "@/lib/member";
import AppBar from "../_components/AppBar";
import ImpersonatePicker from "../_components/ImpersonatePicker";

export const dynamic = "force-dynamic";

const ROLE_VALUES = [
  "state_admin", "regional_organiser", "zonal_organiser", "district_organiser",
  "union_coordinator", "panchayat_coordinator", "temple_coordinator",
];

export default async function ImpersonatePage() {
  const admin = await requireAdminActor();
  if (!admin) redirect("/app");
  const member = await getCurrentMember();
  const lang = await getLang();
  const roles = ROLE_VALUES.map((v) => ({ value: v, label: tr(lang, `role_${v}`) }));
  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={member ? isStateAdmin(member) : true} />
      <main className="asm-main">
        <div className="asm-hero">
          <h1>{tr(lang, "imp_title")}</h1>
          <p>{tr(lang, "imp_sub")}</p>
        </div>
        <ImpersonatePicker roles={roles} m={messages(lang)} />
      </main>
    </>
  );
}
