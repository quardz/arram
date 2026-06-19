"use client";

import { useActionState } from "react";
import { submitVolunteer } from "@/app/actions";
import {
  Field,
  TextArea,
  Select,
  SubmitButton,
  FormMessage,
  initialState,
} from "./fields";

export default function VolunteerForm() {
  const [state, action] = useActionState(submitVolunteer, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First Name" name="firstName" required />
        <Field label="Last Name" name="lastName" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Contact Number" name="phone" type="tel" required />
      </div>
      <Field label="Location" name="location" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Type of Volunteering"
          name="volunteeringType"
          required
          options={[
            "Field Volunteering",
            "Virtual",
            "Content Preparation",
            "Other Opportunities",
          ]}
        />
        <Select
          label="Domain of Interest"
          name="domain"
          required
          options={[
            "Sakthi Maiyam",
            "Saraswathi Maiyam",
            "Dhanvantri Maiyam",
            "Prapancha Maiyam",
            "Mano Maiyam",
          ]}
        />
      </div>
      <TextArea label="Message" name="message" rows={4} />
      <FormMessage state={state} />
      <SubmitButton label="Register" />
    </form>
  );
}
