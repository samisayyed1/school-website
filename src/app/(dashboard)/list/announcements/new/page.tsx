import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

async function postAnnouncement(formData: FormData) {
  "use server";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim() || null;
  const target_role_raw = String(formData.get("target_role") ?? "").trim();
  const target_role = target_role_raw || null;

  if (!title) return;

  await supabase.from("announcements").insert({
    title,
    body,
    target_role,
    created_by: user.id,
  });

  // Fan-out notifications (best-effort, env-gated)
  let recipientsQ = supabase.from("profiles").select("notification_email, notification_phone");
  if (target_role) recipientsQ = recipientsQ.eq("role", target_role);
  const { data: recipients } = await recipientsQ;
  for (const r of recipients ?? []) {
    notify(
      { email: r.notification_email, phone: r.notification_phone },
      {
        subject: `📢 ${title}`,
        html: `<p><strong>${title}</strong></p>${body ? `<p>${body.replace(/\n/g, "<br/>")}</p>` : ""}<p>— The VIP School of Excellence</p>`,
        text: `${title}${body ? "\n\n" + body : ""}`,
        whatsapp: `VIP School: ${title}${body ? " — " + body : ""}`,
      }
    ).catch(() => {});
  }

  revalidatePath("/list/announcements");
  revalidatePath("/student");
  revalidatePath("/parent");
  redirect("/list/announcements");
}

export default async function NewAnnouncementPage() {
  await requireRole(["teacher", "coordinator", "principal", "admin"]);
  return (
    <div className="p-6">
      <Link href="/list/announcements" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Announcements
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">New announcement</h1>

      <form action={postAnnouncement} className="mt-6 space-y-5 max-w-2xl">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
            Title <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            name="title"
            required
            placeholder="School closure on Friday"
            className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
            Message
          </span>
          <textarea
            name="body"
            rows={6}
            className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
            Target audience
          </span>
          <select
            name="target_role"
            className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
          >
            <option value="">Everyone</option>
            <option value="student">Students</option>
            <option value="parent">Parents</option>
            <option value="teacher">Teachers</option>
            <option value="coordinator">Coordinators</option>
            <option value="principal">Principal</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark"
        >
          Post announcement
        </button>
      </form>
    </div>
  );
}
