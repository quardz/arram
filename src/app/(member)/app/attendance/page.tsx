import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang, tr } from "@/lib/i18n";
import { getCurrentMember } from "@/lib/member";

export const dynamic = "force-dynamic";

export default async function AttendanceHome() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  if (!member.assignments.length) redirect("/app/no-access");
  const lang = await getLang();
  return (
    <main className="space-y-4">
      <Link href="/app" className="text-sm text-neutral-500">← {tr(lang, "appName")}</Link>
      <h1 className="text-2xl font-bold">{tr(lang, "home_attendance")}</h1>
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center text-neutral-500">
        {lang === "ta" ? "விரைவில்…" : "Coming next…"}
      </p>
    </main>
  );
}
