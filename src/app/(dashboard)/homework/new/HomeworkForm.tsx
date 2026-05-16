"use client";

import { useFormState, useFormStatus } from "react-dom";
import { postHomework, type PostState } from "./actions";

type Option = { id: string; name: string };

export function HomeworkForm({
  classes,
  subjects,
}: {
  classes: Option[];
  subjects: Option[];
}) {
  const [state, formAction] = useFormState<PostState, FormData>(postHomework, {});

  return (
    <form action={formAction} className="mt-6 space-y-5 max-w-2xl" encType="multipart/form-data">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field label="Title" name="title" required placeholder="e.g. Maths · Multiplication practice" />

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
          Description
        </span>
        <textarea
          name="description"
          rows={5}
          placeholder="Instructions, what to bring, what's expected…"
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15 transition"
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Class" name="class_id" required type="select">
          <option value="">Select class…</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Field>
        <Field label="Subject" name="subject_id" required type="select">
          <option value="">Select subject…</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Field>
      </div>

      <Field label="Due date" name="due_date" type="date" />

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
          Attachment (optional)
        </span>
        <input
          type="file"
          name="file"
          accept="image/*,application/pdf,.doc,.docx"
          className="mt-2 block w-full text-sm text-vip-ink dark:text-zinc-100
            file:mr-4 file:rounded-full file:border-0
            file:bg-vip-emerald/10 file:text-vip-emerald file:font-semibold
            file:px-4 file:py-2 file:hover:bg-vip-emerald/15 cursor-pointer"
        />
        <span className="mt-1 block text-xs text-vip-muted dark:text-zinc-500">
          PDFs, images, or Word docs up to 25 MB.
        </span>
      </label>

      <div className="pt-2 flex gap-3">
        <SubmitButton />
        <a
          href="/homework"
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
      {pending ? "Posting…" : "Post homework"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
        />
      )}
    </label>
  );
}
