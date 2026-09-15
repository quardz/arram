import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import type { GeoNode } from "@/payload-types";
import AppBar from "./_components/AppBar";
import LogoutButton from "./_components/LogoutButton";

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
      <AppBar lang={lang} title={tr(lang, "appName")} loggedIn nav userName={name} userRole={role} />
      <main className="asm-main">
        <div className="asm-greet">
          <div className="hi">{tr(lang, "home_hi")}</div>
          <div className="nm">{name}</div>
          <div className="role">
            <span>{tr(lang, "your_role")}: {tr(lang, `role_${primary.role}`)}</span>
            {node ? <span>· {node.name}</span> : null}
          </div>
        </div>

        <Link href="/app/attendance" className="asm-card" style={{ fontSize: 17, fontWeight: 700 }}>
          <span className="asm-icn">📝</span>
          <span className="asm-cmeta"><b>{tr(lang, "home_attendance")}</b></span>
          <span aria-hidden style={{ color: "var(--asm-brand)", fontSize: 22 }}>→</span>
        </Link>

        <div className="asm-center">
          <LogoutButton label={tr(lang, "home_logout")} />
        </div>
      </main>
    </>
  );
}
