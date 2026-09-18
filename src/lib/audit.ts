import { getPayloadClient } from "@/lib/payload";
import { getSession } from "@/lib/session";

export type AuditAction =
  | "login" | "logout" | "create_session" | "delete_session"
  | "quickadd_person" | "impersonate_start" | "impersonate_stop";

/**
 * Append one audit row. Best-effort: a logging failure must never block the
 * user's actual action. `actor` is always the REAL person (the admin, even
 * while impersonating); `impersonatedPersonId` is the viewed-as person.
 *
 * The `auditLog` collection is not in the committed generated types (the build
 * regenerates them), so the local API call is cast to keep type-check green.
 */
export async function audit(input: {
  actorId: number;
  action: AuditAction;
  actorRole?: string;
  detail?: string;
  impersonatedPersonId?: number;
  eventId?: number;
  targetPersonId?: number;
}): Promise<void> {
  try {
    const payload = await getPayloadClient();
    await (payload as unknown as { create: (a: unknown) => Promise<unknown> }).create({
      collection: "auditLog",
      overrideAccess: true,
      data: {
        action: input.action,
        actor: input.actorId,
        actorRole: input.actorRole ?? null,
        impersonatedPerson: input.impersonatedPersonId ?? null,
        event: input.eventId ?? null,
        targetPerson: input.targetPersonId ?? null,
        detail: input.detail ?? null,
      },
    });
  } catch {
    /* best-effort */
  }
}

/** Actor context from the current session (real actor + viewed-as person). */
export async function auditActor(): Promise<{ actorId: number; impersonatedPersonId?: number } | null> {
  const s = await getSession();
  if (!s) return null;
  return { actorId: s.act?.personId ?? s.personId, impersonatedPersonId: s.act ? s.personId : undefined };
}
