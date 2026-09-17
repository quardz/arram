import { env, flags } from "@/lib/env";

type SendResult = {
  ok: boolean;
  provider: string;
  devCode?: string;
  error?: string;
};

/**
 * Delivers an OTP based on SMS_PROVIDER:
 *  - "console" (default): logs the OTP/message to the server console (Vercel
 *    function logs). No SMS is sent. Lets the flow be tested without credits.
 *  - "fast2sms": sends a real SMS via Fast2SMS (requires FAST2SMS_API_KEY).
 * In non-production the code is also returned as `devCode` so the login screen
 * can show it; it is never returned to the client in production.
 */
export async function sendOtpSms(
  phone: string,
  code: string,
  message?: string,
): Promise<SendResult> {
  const isProd = process.env.NODE_ENV === "production";
  const provider = env.SMS_PROVIDER || "console";
  const logLine = message || `OTP for ${phone}: ${code}`;

  // Console provider (default): log only, never send.
  if (provider !== "fast2sms") {
    console.log(`[otp:console] ${phone} — ${logLine}`);
    return { ok: true, provider: "console", ...(isProd ? {} : { devCode: code }) };
  }

  // Fast2SMS provider selected but no key configured: log and (in prod) fail
  // clearly rather than pretending to send.
  if (!flags.hasSMS) {
    console.log(`[otp:fast2sms] FAST2SMS_API_KEY missing — ${phone} — ${logLine}`);
    if (isProd) return { ok: false, provider: "fast2sms", error: "sms_not_configured" };
    return { ok: true, provider: "fast2sms", devCode: code };
  }

  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: env.FAST2SMS_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        route: env.FAST2SMS_ROUTE || "otp",
        variables_values: code,
        numbers: phone,
      }).toString(),
    });
    const data: unknown = await res.json().catch(() => ({}));
    const ret = (data as { return?: boolean | string })?.return;
    if (res.ok && (ret === true || ret === "true")) return { ok: true, provider: "fast2sms" };
    // Log the exact Fast2SMS response (status + body) so failures are debuggable.
    console.error(`[otp:fast2sms] send failed phone=${phone} httpStatus=${res.status} body=${JSON.stringify(data)}`);
    if (!isProd) {
      return { ok: true, provider: "fast2sms", devCode: code };
    }
    const msg = (data as { message?: unknown })?.message;
    const arrMsg = Array.isArray(msg) ? msg.join("; ") : msg;
    return {
      ok: false,
      provider: "fast2sms",
      error: typeof arrMsg === "string" && arrMsg ? arrMsg : `send failed (HTTP ${res.status})`,
    };
  } catch (e) {
    console.error(`[otp:fast2sms] send threw phone=${phone}`, e);
    if (!isProd) {
      return { ok: true, provider: "fast2sms", devCode: code };
    }
    return { ok: false, provider: "fast2sms", error: (e as Error).message };
  }
}
