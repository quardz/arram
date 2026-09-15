import { getSession } from "@/lib/session";
import { loadMemberById, isStateAdmin, type CurrentMember } from "@/lib/member";

/** The REAL member behind the session (the admin, even while impersonating). */
export async function realActor(): Promise<CurrentMember | null> {
  const s = await getSession();
  if (!s) return null;
  return loadMemberById(s.act?.personId ?? s.personId);
}

/** Real actor if they are a state_admin, else null. Impersonation gate. */
export async function requireAdminActor(): Promise<CurrentMember | null> {
  const a = await realActor();
  return a && isStateAdmin(a) ? a : null;
}
