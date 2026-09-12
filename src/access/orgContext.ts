import type { PayloadRequest } from "payload";

export type OrgContext = {
  isSignedIn: boolean;
  isAdmin: boolean;
  /** active org assignments for the current user */
  assignments: Array<{ id: string; role: string; geoNode: string | null }>;
  /** geoNode ids the user is assigned to (their own nodes, not the subtree) */
  nodeIds: string[];
};

const EMPTY: OrgContext = { isSignedIn: false, isAdmin: false, assignments: [], nodeIds: [] };

/**
 * Resolve the current user's org context (assignments, admin flag). Cached on req.
 * Falls back to an empty context on any error so access checks never throw.
 */
export async function getOrgContext(req: PayloadRequest): Promise<OrgContext> {
  const user = req.user;
  if (!user) return EMPTY;
  const anyReq = req as unknown as { _orgCtx?: OrgContext };
  if (anyReq._orgCtx) return anyReq._orgCtx;

  let assignments: OrgContext["assignments"] = [];
  try {
    const res = await req.payload.find({
      collection: "orgAssignments",
      where: { and: [{ person: { equals: user.id } }, { active: { equals: true } }] },
      depth: 0,
      limit: 1000,
      req,
    });
    assignments = res.docs.map((d: Record<string, unknown>) => ({
      id: String(d.id),
      role: String(d.role ?? ""),
      geoNode:
        d.geoNode == null
          ? null
          : typeof d.geoNode === "object"
            ? String((d.geoNode as { id: unknown }).id)
            : String(d.geoNode),
    }));
  } catch {
    assignments = [];
  }

  const ctx: OrgContext = {
    isSignedIn: true,
    isAdmin: assignments.some((a) => a.role === "state_admin"),
    assignments,
    nodeIds: assignments.map((a) => a.geoNode).filter((x): x is string => Boolean(x)),
  };
  anyReq._orgCtx = ctx;
  return ctx;
}
