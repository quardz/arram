import { getSession } from "@/lib/session";
import { loadMemberById } from "@/lib/member";
import { getLang, tr } from "@/lib/i18n";
import StopImpersonatingButton from "./StopImpersonatingButton";

// Sticky notice shown across the app while the admin is viewing as someone.
export default async function ImpersonationBanner() {
  const s = await getSession();
  if (!s?.act) return null;
  const target = await loadMemberById(s.personId);
  const lang = await getLang();
  const nm = target
    ? (target.person.name && target.person.name !== "multiple" ? target.person.name : target.person.phone)
    : String(s.personId);
  return (
    <div className="asm-imp-banner">
      <span>{tr(lang, "imp_viewing_as")}: <b>{nm}</b></span>
      <StopImpersonatingButton label={tr(lang, "imp_stop")} />
    </div>
  );
}
