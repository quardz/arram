import { env, flags } from "@/lib/env";

/** Sends an OTP SMS via Fast2SMS. In non-production, logs the code instead of
 *  failing so the flow is testable without SMS credits. */
export async function sendOtpSms(
  phone: string,
  code: string,
): Promise<{ ok: boolean; devCode?: string; error?: string }> {
  const isProd = process.env.NODE_ENV === "production";
  if (!flags.hasSMS) {
    if (!isProd) {
      console.log(`[otp:dev] ${phone} -> ${code}`);
      return { ok: true, devCode: code };
    }
    return { ok: false, error: "SMS not configured" };
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
    if (res.ok && (ret === true || ret === "true")) return { ok: true };
    if (!isProd) {
      console.log(`[otp:dev-fallback] ${phone} -> ${code}`, data);
      return { ok: true, devCode: code };
    }
    const msg = (data as { message?: unknown })?.message;
    return { ok: false, error: typeof msg === "string" ? msg : "send failed" };
  } catch (e) {
    if (!isProd) {
      console.log(`[otp:dev-exc] ${phone} -> ${code}`);
      return { ok: true, devCode: code };
    }
    return { ok: false, error: (e as Error).message };
  }
}
