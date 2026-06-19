import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";

const baseField =
  "w-full rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20";

export function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label} {required && <span className="text-maroon">*</span>}
      </span>
      <input
        className={baseField}
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  required,
  rows = 4,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label} {required && <span className="text-maroon">*</span>}
      </span>
      <textarea className={baseField} name={name} required={required} rows={rows} />
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label} {required && <span className="text-maroon">*</span>}
      </span>
      <select className={baseField} name={name} required={required} defaultValue="">
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SubmitButton({ label = "Submit" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-maroon px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-maroon-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting…" : label}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState | null }) {
  if (!state?.message) return null;
  return (
    <p
      className={`rounded-md px-4 py-3 text-sm ${
        state.ok
          ? "bg-green-50 text-green-800 ring-1 ring-green-200"
          : "bg-red-50 text-red-800 ring-1 ring-red-200"
      }`}
    >
      {state.message}
    </p>
  );
}

export const initialState: FormState = { ok: false, message: "" };
