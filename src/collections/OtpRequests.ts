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
    // Message log: the raw code, delivery provider, status and the message text,
    // so every issued OTP is a full record (phone + code + time + message).
    { name: "code", type: "text" },
    { name: "provider", type: "text" },
    { name: "status", type: "text" },
    { name: "message", type: "textarea" },
  ],
};

export default OtpRequests;
