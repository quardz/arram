/**
 * TEST-ONLY login bypass (for use while SMS/OTP delivery isn't set up).
 * Enter phone TEST_LOGIN.phone + code TEST_LOGIN.code to sign in as the
 * TEST_LOGIN.loginAsPhone member (default: the state admin).
 *
 * SECURITY: this is a backdoor. It is ON by default for bring-up. Disable it
 * for real launch by setting DISABLE_TEST_LOGIN=true in the environment.
 * All values are env-overridable.
 */
export const TEST_LOGIN = {
  enabled: process.env.DISABLE_TEST_LOGIN !== "true",
  phone: (process.env.TEST_LOGIN_PHONE || "9999999999").trim(),
  code: (process.env.TEST_LOGIN_CODE || "9999").trim(),
  loginAsPhone: (process.env.TEST_LOGIN_AS || "9901357171").trim(),
};
