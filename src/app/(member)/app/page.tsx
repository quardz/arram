import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember, isStateAdmin } from "@/lib/member";
import type { GeoNode } from "@/payload-types";
import AppBar from "./_components/AppBar";

export const dynamic = "force-dynamic";

export default async function MemberHome() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");

  const lang = await getLang();
  const primary = member.assignments[0];
  const node = typeof primary.geoNode === "object" ? (primary.geoNode as GeoNode) : null;
  const name = member.person.name && member.person.name !== "multiple" ? member.person.name : member.person.phone;
  const role = `${tr(lang, `role_${primary.role}`)}${node ? ` · ${node.name}` : ""}`;

  return (
    <>
      <AppBar lang={lang} title={tr(lang, "appName")} loggedIn nav isAdmin={isStateAdmin(member)} userName={name} userRole={role} />
      <main className="asm-main">
        <Link href="/app/attendance" className="asm-card" style={{ fontSize: 17, fontWeight: 700 }}>
          <span className="asm-icn">📝</span>
          <span className="asm-cmeta"><b>{tr(lang, "home_attendance")}</b></span>
          <span aria-hidden style={{ color: "var(--asm-brand)", fontSize: 22 }}>→</span>
        </Link>
      </main>
    </>
  );
}
