import { redirect } from "next/navigation";
import { getLang, messages, tr } from "@/lib/i18n";
import { getCurrentMember, isAdmin } from "@/lib/member";
import { requireAdminActor } from "@/lib/impersonate";
import { getPayloadClient } from "@/lib/payload";
import { ROLE_VALUES } from "@/lib/org";
import type { GeoNode, OrgAssignment, Person } from "@/payload-types";
import AppBar from "../_components/AppBar";
import OrgChart from "../_components/OrgChart";

export const dynamic = "force-dynamic";

const rel = (v: unknown): number | null =>
  v == null ? null : typeof v === "object" ? ((v as { id?: number }).id ?? null) : (v as number);

export default async function OrgPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/app/login");
  const lang = await getLang();
  const admin = (await requireAdminActor()) != null;
  const payload = await getPayloadClient();

  const nodesR = await payload.find({ collection: "geoNodes", overrideAccess: true, depth: 0, limit: 5000, sort: "name" });
  const nodes = (nodesR.docs as GeoNode[]).map((n) => ({
    id: n.id as number, name: n.name, nameTamil: n.nameTamil ?? null,
    level: (n.level as string) ?? "", parentId: rel(n.parent),
  }));

  const asgR = await payload.find({
    collection: "orgAssignments", overrideAccess: true, depth: 1, limit: 5000,
    where: { active: { equals: true } },
  });
  const assignments = (asgR.docs as OrgAssignment[]).map((a) => {
    const p = typeof a.person === "object" ? (a.person as Person) : null;
    return {
      id: a.id as number, nodeId: rel(a.geoNode) as number,
      personId: p ? (p.id as number) : (rel(a.person) as number),
      name: p ? (p.name && p.name !== "multiple" ? p.name : p.phone) : "",
      phone: p ? p.phone : "",
      role: a.role as string,
      fullTime: !!(p as unknown as { fullTime?: boolean })?.fullTime,
    };
  }).filter((a) => a.nodeId);

  const roleLabels: Record<string, string> = {};
  for (const r of ROLE_VALUES) roleLabels[r] = tr(lang, `role_${r}`);

  return (
    <>
      <AppBar lang={lang} backHref="/app" backLabel={tr(lang, "appName")} loggedIn nav isAdmin={isAdmin(member)} />
      <OrgChart nodes={nodes} assignments={assignments} isAdmin={admin} lang={lang} roleLabels={roleLabels} m={messages(lang)} />
    </>
  );
}
