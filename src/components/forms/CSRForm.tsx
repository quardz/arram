"use client";

import { useActionState } from "react";
import { submitCSR } from "@/app/actions";
import {
  Field,
  TextArea,
  SubmitButton,
  FormMessage,
  initialState,
} from "./fields";

export default function CSRForm() {
  const [state, action] = useActionState(submitCSR, initialState);

  return (
    <form action={action} className="space-y-5">
      <Field label="Organisation" name="organisation" required />
      <Field label="Contact Person" name="contactPerson" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Contact Number" name="phone" type="tel" />
      </div>
      <TextArea label="How would you like to partner with us?" name="message" rows={4} />
      <FormMessage state={state} />
      <SubmitButton label="Submit Enquiry" />
    </form>
  );
}
