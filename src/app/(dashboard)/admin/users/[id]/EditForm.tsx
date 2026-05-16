"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateNotificationChannels, type UpdateState } from "./actions";

export function EditForm({
  id,
  notificationEmail,
  notificationPhone,
}: {
  id: string;
  notificationEmail: string | null;
  notificationPhone: string | null;
}) {
  const action = updateNotificationChannels.bind(null, id);
  const [state, formAction] = useFormState<UpdateState, FormData>(action, {});

  return (
    <form action={formAction} className="mt-6 space-y-5 max-w-xl">
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

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
          Notification email
        </span>
        <input
          type="email"
          name="notification_email"
          defaultValue={notificationEmail ?? ""}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
        />
        <span className="mt-1 block text-xs text-vip-muted dark:text-zinc-500">
          Where school emails are delivered. Distinct from login email.
        </span>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
          Notification phone (WhatsApp)
        </span>
        <input
          type="tel"
          name="notification_phone"
          defaultValue={notificationPhone ?? ""}
          placeholder="+91 99999 99999"
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
        />
        <span className="mt-1 block text-xs text-vip-muted dark:text-zinc-500">
          Use E.164 format (+country code, no spaces). WhatsApp updates go here.
        </span>
      </label>

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
      className="inline-flex items-center justify-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
