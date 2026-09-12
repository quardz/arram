/**
 * Centralized environment + capability flags.
 *
 * Every new feature reads a flag here and DEGRADES GRACEFULLY when its config
 * is missing, instead of crashing. The existing public website never depends on
 * any of these, so with zero env vars set the app still builds, boots, and
 * serves the original site from the repo content files.
 */

const str = (v: string | undefined) => (v ?? "").trim();

export const env = {
  // Neon: DATABASE_URI is the (pooled) runtime connection; DATABASE_URI_DIRECT
  // is the non-pooled connection used for schema push / migrations (Drizzle DDL
  // is more reliable off the pooler).
  DATABASE_URI: str(process.env.DATABASE_URI),
  DATABASE_URI_DIRECT: str(process.env.DATABASE_URI_DIRECT),
  PAYLOAD_SECRET: str(process.env.PAYLOAD_SECRET),

  FAST2SMS_API_KEY: str(process.env.FAST2SMS_API_KEY),
  // Fast2SMS "OTP" route (DLT-exempt) vs "q"/"v3" transactional route.
  FAST2SMS_ROUTE: str(process.env.FAST2SMS_ROUTE) || "otp",

  R2_ENDPOINT: str(process.env.R2_ENDPOINT), // https://<accountid>.r2.cloudflarestorage.com
  R2_BUCKET: str(process.env.R2_BUCKET),
  R2_ACCESS_KEY_ID: str(process.env.R2_ACCESS_KEY_ID),
  R2_SECRET_ACCESS_KEY: str(process.env.R2_SECRET_ACCESS_KEY),
  R2_PUBLIC_URL: str(process.env.R2_PUBLIC_URL), // public base URL for served media

  SERVER_URL: str(process.env.NEXT_PUBLIC_SERVER_URL) || "http://localhost:3000",

  // Session length in days (configurable). Defaults to 30.
  SESSION_DAYS: Number(str(process.env.SESSION_DAYS)) || 30,

  // Org rule: allow more than one active org person per geo node.
  // Default false => UI enforces one-person-per-node.
  ALLOW_MULTIPLE_PER_NODE: str(process.env.ALLOW_MULTIPLE_PER_NODE) === "true",
} as const;

/**
 * Connection string selection:
 *  - Serverless runtime (production) wants the POOLED url (DATABASE_URI) to avoid
 *    exhausting Neon connections.
 *  - DDL — dev "push" and `payload migrate` — wants the DIRECT (non-pooled) url,
 *    which reliably supports schema changes.
 */
const isProd = process.env.NODE_ENV === "production";
const isMigrating =
  process.env.PAYLOAD_MIGRATING === "true" ||
  process.argv.some((a) => a.includes("migrate"));

/**
 * Drizzle "push" auto-syncs the schema in DEV only. Payload ignores push in
 * production (connect.js gates it behind NODE_ENV !== "production"); prod uses
 * the committed migrations in src/migrations instead, applied by `payload
 * migrate` (run at build time via the "vercel-build" script). Set DB_PUSH=false
 * to also use migrations locally.
 */
export const DB_PUSH = !isProd && process.env.DB_PUSH !== "false";

/**
 * Connection selection:
 *  - DDL — dev push and `payload migrate` (build/CLI) — needs the DIRECT
 *    (non-pooled) Neon url, which reliably supports schema changes.
 *  - Steady-state production serverless runtime uses the POOLED url to avoid
 *    exhausting Neon connections.
 */
export const DB_CONNECTION_STRING =
  isMigrating || !isProd
    ? env.DATABASE_URI_DIRECT || env.DATABASE_URI
    : env.DATABASE_URI || env.DATABASE_URI_DIRECT;

/** Capability flags — check these before using a feature. */
export const flags = {
  /** Payload + DB usable at all (needs a DB URL and a secret). */
  payloadEnabled: Boolean(DB_CONNECTION_STRING && env.PAYLOAD_SECRET),
  /** Media uploads to R2 available. */
  hasR2: Boolean(
    env.R2_ENDPOINT &&
      env.R2_BUCKET &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY,
  ),
  /** SMS OTP sending available. */
  hasSMS: Boolean(env.FAST2SMS_API_KEY),
} as const;

export const SESSION_SECONDS = env.SESSION_DAYS * 24 * 60 * 60;
