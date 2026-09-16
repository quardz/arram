"use server";

// Server actions for the site's forms.
//
// For now every submission is logged server-side (visible in the server / Vercel
// function logs). A database write can be added later by replacing the body of
// `persistSubmission` — the rest of the flow stays the same.

import { getPayloadClient } from "@/lib/payload";
import { normalizePhone } from "@/lib/member";
import { pincodeToGeoNode } from "@/lib/pincodeGeo";

export type FormState = {
  ok: boolean;
  message: string;
};

/** 10-digit phone → 7-char uppercase base-36 referral code (matches the client). */
function phoneToReferral(phone: string): string {
  const n = parseInt(phone.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n.toString(36).toUpperCase().padStart(7, "0") : "";
}

export type JoinInput = {
  name: string;
  phone: string;
  pincode: string;
  referral?: string;
  dob?: string;
  gender?: "" | "Male" | "Female";
};

export type JoinResult = { ok: boolean; message: string; referralCode?: string };

/**
 * Website "Join Us" submission → writes into the `people` collection.
 * - New phone: created with source "join-form" (the differentiator), geoNode
 *   resolved from the pincode, referralCode derived from phone, referredBy
 *   linked from the referral code when it resolves to an existing person.
 * - Existing phone: fills only missing fields; the original `source` is kept so
 *   imported/org people are never relabelled.
 */
export async function submitJoin(input: JoinInput): Promise<JoinResult> {
  const name = (input.name || "").trim();
  const phone = normalizePhone(input.phone || "");
  const pincode = (input.pincode || "").replace(/\D/g, "").slice(0, 6);
  const referralCode = phoneToReferral(phone);

  if (!name) return { ok: false, message: "Please enter your name." };
  if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, message: "Enter a valid 10-digit mobile number." };
  if (!/^6\d{5}$/.test(pincode)) return { ok: false, message: "Enter a valid 6-digit Tamil Nadu PIN code." };

  const gender = input.gender === "Male" ? "male" : input.gender === "Female" ? "female" : undefined;
  const geoNode = pincodeToGeoNode(pincode);

  try {
    const payload = await getPayloadClient();

    // Resolve referrer (optional) from their referral code.
    let referredBy: number | undefined;
    const rc = (input.referral || "").trim().toUpperCase();
    if (/^[0-9A-Z]{7}$/.test(rc)) {
      const r = await payload.find({ collection: "people", overrideAccess: true, limit: 1, where: { referralCode: { equals: rc } } });
      referredBy = r.docs[0]?.id as number | undefined;
    }

    const existing = await payload.find({ collection: "people", overrideAccess: true, limit: 1, where: { phone: { equals: phone } } });
    const p = existing.docs[0] as unknown as (Record<string, unknown> & { id: number; name?: string | null; referralCode?: string | null }) | undefined;

    if (p) {
      // Fill only missing fields; never change an existing person's source.
      const patch: Record<string, unknown> = {};
      if ((!p.name || p.name === "multiple") && name) patch.name = name;
      if (!p.pincode && pincode) patch.pincode = pincode;
      if (!p.dob && input.dob) patch.dob = input.dob;
      if (!p.gender && gender) patch.gender = gender;
      if (!p.geoNode && geoNode != null) patch.geoNode = geoNode;
      if (!p.referredBy && referredBy != null) patch.referredBy = referredBy;
      if (!p.referralCode) patch.referralCode = referralCode;
      if (Object.keys(patch).length) {
        await payload.update({ collection: "people", id: p.id, overrideAccess: true, data: patch as unknown as { name?: string } });
      }
      return { ok: true, referralCode: (p.referralCode as string) || referralCode, message: "You are already registered — welcome back!" };
    }

    await payload.create({
      collection: "people", overrideAccess: true,
      data: {
        phone, name, pincode,
        dob: input.dob || undefined,
        gender,
        geoNode,
        referredBy,
        referralCode,
        source: "join-form",
        otpVerified: false,
      } as unknown as { phone: string },
    });
    return { ok: true, referralCode, message: "Welcome! You have joined the community." };
  } catch (e) {
    // Unique-phone races etc. — surface a friendly message.
    return { ok: false, message: (e as Error)?.message?.includes("unique") ? "This number is already registered." : "Something went wrong. Please try again." };
  }
}

type Submission = {
  type: "contact" | "volunteer" | "csr";
  data: Record<string, string>;
};

async function persistSubmission({ type, data }: Submission) {
  // TODO: replace with a database insert (e.g. Postgres / Prisma / Drizzle).
  console.log(
    `[form:${type}] ${new Date().toISOString()} ` + JSON.stringify(data),
  );
}

function value(form: FormData, key: string) {
  return (form.get(key) ?? "").toString().trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const data = {
    name: value(form, "name"),
    email: value(form, "email"),
    phone: value(form, "phone"),
    subject: value(form, "subject"),
    message: value(form, "message"),
  };

  if (!data.name || !data.email || !data.message) {
    return { ok: false, message: "Please fill in your name, email and message." };
  }
  if (!EMAIL_RE.test(data.email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  await persistSubmission({ type: "contact", data });
  return {
    ok: true,
    message: "Thank you for reaching out. We will get back to you soon.",
  };
}

export async function submitVolunteer(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const data = {
    firstName: value(form, "firstName"),
    lastName: value(form, "lastName"),
    email: value(form, "email"),
    phone: value(form, "phone"),
    location: value(form, "location"),
    volunteeringType: value(form, "volunteeringType"),
    domain: value(form, "domain"),
    message: value(form, "message"),
  };

  if (!data.firstName || !data.email || !data.phone || !data.location) {
    return {
      ok: false,
      message: "Please fill in your name, email, contact number and location.",
    };
  }
  if (!EMAIL_RE.test(data.email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  await persistSubmission({ type: "volunteer", data });
  return {
    ok: true,
    message:
      "Thank you for registering as a volunteer. Our team will reach out to you.",
  };
}

export async function submitCSR(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const data = {
    organisation: value(form, "organisation"),
    contactPerson: value(form, "contactPerson"),
    email: value(form, "email"),
    phone: value(form, "phone"),
    message: value(form, "message"),
  };

  if (!data.organisation || !data.contactPerson || !data.email) {
    return {
      ok: false,
      message:
        "Please fill in your organisation, contact person and email address.",
    };
  }
  if (!EMAIL_RE.test(data.email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  await persistSubmission({ type: "csr", data });
  return {
    ok: true,
    message: "Thank you for your interest. Our CSR team will contact you shortly.",
  };
}
