"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/actions";
import {
  Field,
  TextArea,
  SubmitButton,
  FormMessage,
  initialState,
} from "./fields";

export default function ContactForm({
  defaultSubject,
}: {
  defaultSubject?: string;
}) {
  const [state, action] = useActionState(submitContact, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contact Number" name="phone" type="tel" />
        <Field label="Subject" name="subject" defaultValue={defaultSubject} />
      </div>
      <TextArea label="Message" name="message" required rows={5} />
      <FormMessage state={state} />
      <SubmitButton label="Send Message" />
    </form>
  );
}
