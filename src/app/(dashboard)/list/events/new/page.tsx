import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function postEvent(formData: FormData) {
  "use server";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const start_at = String(formData.get("start_at") ?? "");
  const end_at = String(formData.get("end_at") ?? "") || null;

  if (!title || !start_at) return;

  await supabase.from("events").insert({
    title,
    description,
    location,
    start_at,
    end_at,
    created_by: user.id,
  });

  revalidatePath("/list/events");
  redirect("/list/events");
}

export default async function NewEventPage() {
  await requireRole(["teacher", "coordinator", "principal", "admin"]);
  return (
    <div className="p-6">
      <Link href="/list/events" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Events
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">New event</h1>

      <form action={postEvent} className="mt-6 space-y-5 max-w-2xl">
        <Field name="title" label="Title" required />
        <Field name="description" label="Description" textarea />
        <Field name="location" label="Location" />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="start_at" label="Start" type="datetime-local" required />
          <Field name="end_at" label="End" type="datetime-local" />
        </div>
        <button
          type="submit"
          className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark"
        >
          Create event
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
        />
      )}
    </label>
  );
}
