import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";
import type { GeoNode } from "@/payload-types";
import LangToggle from "./_components/LangToggle";
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

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-500">{tr(lang, "appName")}</span>
        <LangToggle lang={lang} />
      </div>

      <div className="rounded-2xl bg-neutral-900 p-5 text-white">
        <p className="text-sm text-neutral-300">{tr(lang, "home_hi")}</p>
        <p className="text-xl font-bold">{name}</p>
        <p className="mt-1 text-sm text-neutral-300">
          {tr(lang, "your_role")}: {tr(lang, `role_${primary.role}`)}
          {node ? ` · ${node.name}` : ""}
        </p>
      </div>

      <div className="grid gap-4">
        <Link href="/app/attendance"
          className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 text-lg font-semibold shadow-sm active:scale-[0.99]">
          <span>{tr(lang, "home_attendance")}</span>
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="pt-4 text-center">
        <LogoutButton label={tr(lang, "home_logout")} />
      </div>
    </main>
  );
}
