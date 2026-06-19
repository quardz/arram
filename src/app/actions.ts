"use server";

// Server actions for the site's forms.
//
// For now every submission is logged server-side (visible in the server / Vercel
// function logs). A database write can be added later by replacing the body of
// `persistSubmission` — the rest of the flow stays the same.

export type FormState = {
  ok: boolean;
  message: string;
};

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
