import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin, isReadOnly } from "@/lib/member";
import type { GeoNode } from "@/payload-types";
import AppBar from "../_components/AppBar";
import ProfileForm from "../_components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  const p = member.person as unknown as {
    name?: string; phone: string; email?: string; secondaryPhone?: string;
    socialLinks?: { platform: string; url: string }[]; fullTime?: boolean;
  };
  const primary = member.assignments[0];
  const node = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const roleText = `${tr(lang, `role_${primary.role}`)}${node ? ` · ${node.name}` : ""}`;
  const initial = {
    name: p.name && p.name !== "multiple" ? p.name : "",
    primaryPhone: p.phone,
    email: p.email || "",
    secondaryPhone: p.secondaryPhone || "",
    socialLinks: Array.isArray(p.socialLinks) ? p.socialLinks : [],
    fullTime: !!p.fullTime,
  };
  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={isAdmin(member)} userName={initial.name || p.phone} userRole={roleText} />
      <main className="asm-main">
        <div className="asm-hero"><h1>{tr(lang, "prof_title")}</h1></div>
        <ProfileForm initial={initial} roleText={roleText} isAdmin={isAdmin(member)} readOnly={isReadOnly(member)} m={messages(lang)} />
      </main>
    </>
  );
}
