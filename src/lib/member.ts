import { getPayloadClient } from "@/lib/payload";
import { getSession } from "@/lib/session";
import { READONLY_ROLES } from "@/lib/org";
import type { OrgAssignment, Person } from "@/payload-types";

export const normalizePhone = (raw: string) =>
  (raw || "").replace(/\D/g, "").replace(/^91(\d{10})$/, "$1").replace(/^0(\d{10})$/, "$1");

export async function findPersonByPhone(phone: string): Promise<Person | null> {
  const payload = await getPayloadClient();
  const r = await payload.find({
    collection: "people",
    overrideAccess: true,
    limit: 1,
    where: { phone: { equals: phone } },
  });
  return (r.docs[0] as Person) || null;
}

export async function activeAssignmentCount(personId: number): Promise<number> {
  const payload = await getPayloadClient();
  const r = await payload.count({
    collection: "orgAssignments",
    overrideAccess: true,
    where: { and: [{ person: { equals: personId } }, { active: { equals: true } }] },
  });
  return r.totalDocs;
}

export type CurrentMember = { person: Person; assignments: OrgAssignment[] };

export async function getCurrentMember(): Promise<CurrentMember | null> {
  const s = await getSession();
  if (!s) return null;
  const payload = await getPayloadClient();
  let person: Person | null = null;
  try {
    person = (await payload.findByID({
      collection: "people",
      id: s.personId,
      overrideAccess: true,
      depth: 0,
    })) as Person;
  } catch {
    return null;
  }
  if (!person) return null;
  const asg = await payload.find({
    collection: "orgAssignments",
    overrideAccess: true,
    depth: 1,
    limit: 50,
    where: { and: [{ person: { equals: s.personId } }, { active: { equals: true } }] },
  });
  return { person, assignments: asg.docs as OrgAssignment[] };
}

/** Role of the member's first assignment (for display / audit context). */
export function primaryRole(member: CurrentMember): string | undefined {
  return (member.assignments[0]?.role as string | undefined) ?? undefined;
}

/** True if the member holds an active state_admin assignment. */
export function isStateAdmin(member: CurrentMember): boolean {
  return member.assignments.some((a) => a.role === "state_admin");
}

/** state_admin OR super_admin — the "admin or above" gate. */
export function isAdmin(member: CurrentMember): boolean {
  return member.assignments.some((a) => a.role === "state_admin" || (a.role as string) === "super_admin");
}

export function isSuperAdmin(member: CurrentMember): boolean {
  return member.assignments.some((a) => (a.role as string) === "super_admin");
}

/** Read-only member: has assignments, and EVERY active assignment is a
 *  read-only role (e.g. State functionary). Such members may view but never
 *  create, edit, take attendance, or impersonate. */
export function isReadOnly(member: CurrentMember): boolean {
  return member.assignments.length > 0 && member.assignments.every((a) => READONLY_ROLES.has(a.role as string));
}

/** Load any member by person id (person + active assignments). */
export async function loadMemberById(personId: number): Promise<CurrentMember | null> {
  const payload = await getPayloadClient();
  let person: Person | null = null;
  try {
    person = (await payload.findByID({ collection: "people", id: personId, overrideAccess: true, depth: 0 })) as Person;
  } catch {
    return null;
  }
  if (!person) return null;
  const asg = await payload.find({
    collection: "orgAssignments", overrideAccess: true, depth: 1, limit: 50,
    where: { and: [{ person: { equals: personId } }, { active: { equals: true } }] },
  });
  return { person, assignments: asg.docs as OrgAssignment[] };
}
