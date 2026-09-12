import type { CollectionConfig } from "payload";

/**
 * OTP issue/verify support. Written/read only by server code via the local API
 * (overrideAccess), so external access is closed.
 */
export const OtpRequests: CollectionConfig = {
  slug: "otpRequests",
  admin: { hidden: true },
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: "phone", type: "text", required: true, index: true },
    { name: "codeHash", type: "text", required: true },
    { name: "expiresAt", type: "date", required: true },
    { name: "attempts", type: "number", defaultValue: 0 },
    { name: "consumed", type: "checkbox", defaultValue: false },
  ],
};

export default OtpRequests;
