"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createUserAction, type CreateUserState } from "./actions";

const initialState: CreateUserState = {};

export function CreateUserForm() {
  const [state, formAction] = useFormState(createUserAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5 max-w-xl">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field label="Full name" name="full_name" required />
      <Field label="Role" name="role" required type="select">
        <option value="">Select…</option>
        <option value="student">Student</option>
        <option value="parent">Parent</option>
        <option value="teacher">Teacher</option>
        <option value="coordinator">Coordinator</option>
        <option value="principal">Principal</option>
        <option value="admin">Admin (IT)</option>
      </Field>

      <fieldset className="space-y-5">
        <legend className="text-xs uppercase tracking-[0.18em] text-vip-muted dark:text-zinc-500">
          Login credentials
        </legend>
        <Field label="Email (login)" name="email" type="email" required placeholder="firstname.lastname@vipschoolnizamabad.com" />
        <Field label="Phone (login)" name="phone" type="tel" placeholder="+91 99999 99999" />
        <Field label="Initial password" name="password" type="password" required hint="Min 8 chars. Share securely; user can change later." />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xs uppercase tracking-[0.18em] text-vip-muted dark:text-zinc-500">
          Notification channels (where school updates are sent)
        </legend>
        <Field label="Notification email" name="notification_email" type="email" hint="Defaults to the login email if blank." />
        <Field label="Notification phone (WhatsApp)" name="notification_phone" type="tel" hint="Defaults to the login phone if blank. Use E.164 format with +country code." />
      </fieldset>

      <div className="pt-2 flex gap-3">
        <SubmitButton />
        <a
          href="/admin/users"
          className="inline-flex items-center justify-center rounded-full border border-vip-emerald/20 px-6 py-3 text-sm font-semibold text-vip-emerald hover:bg-vip-emerald/5"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Creating…" : "Create user"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  hint,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {type === "select" ? (
        <select
          name={name}
          required={required}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15 transition"
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15 transition"
        />
      )}
      {hint && <span className="mt-1 block text-xs text-vip-muted dark:text-zinc-500">{hint}</span>}
    </label>
  );
}
