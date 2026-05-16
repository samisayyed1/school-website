"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateOwnProfile, type ProfileState } from "./actions";

export function ProfileForm({
  fullName,
  avatarUrl,
  notificationEmail,
  notificationPhone,
}: {
  fullName: string;
  avatarUrl: string | null;
  notificationEmail: string | null;
  notificationPhone: string | null;
}) {
  const [state, formAction] = useFormState<ProfileState, FormData>(updateOwnProfile, {});
  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {state.ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Saved.
        </div>
      )}
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field label="Full name" name="full_name" defaultValue={fullName} required />
      <Field
        label="Avatar URL"
        name="avatar_url"
        defaultValue={avatarUrl ?? ""}
        hint="Direct link to an image (Imgur, etc.). Leave blank for initials."
      />
      <Field
        label="Notification email"
        name="notification_email"
        type="email"
        defaultValue={notificationEmail ?? ""}
        hint="Where school emails go. Defaults to your login email."
      />
      <Field
        label="Notification phone (WhatsApp)"
        name="notification_phone"
        type="tel"
        defaultValue={notificationPhone ?? ""}
        hint="E.164 format with +country code, e.g. +919999999999."
      />

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark transition disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
      />
      {hint && (
        <span className="mt-1 block text-xs text-vip-muted dark:text-zinc-500">{hint}</span>
      )}
    </label>
  );
}
