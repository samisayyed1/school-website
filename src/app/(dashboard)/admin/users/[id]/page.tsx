import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, ROLE_LABEL } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EditForm } from "./EditForm";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  await requireRole(["admin", "principal"]);
  const supabase = createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,phone,notification_email,notification_phone")
    .eq("id", params.id)
    .single();

  if (!target) notFound();

  return (
    <div className="p-6">
      <Link href="/admin/users" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Users
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">{target.full_name}</h1>
      <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
        {ROLE_LABEL[target.role as keyof typeof ROLE_LABEL]}
      </p>

      <section className="mt-8 rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
        <h2 className="font-semibold">Login credentials</h2>
        <p className="mt-1 text-xs text-vip-muted dark:text-zinc-500">
          {"Locked. Admin (IT) cannot change a user's login email, phone, or role after creation — that's a Principal-only action."}
        </p>
        <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500">Login email</dt>
            <dd className="mt-1 font-medium">{target.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500">Login phone</dt>
            <dd className="mt-1 font-medium">{target.phone ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
        <h2 className="font-semibold">Notification channels</h2>
        <p className="mt-1 text-xs text-vip-muted dark:text-zinc-500">
          These are where school updates land. Change anytime.
        </p>
        <EditForm
          id={target.id}
          notificationEmail={target.notification_email}
          notificationPhone={target.notification_phone}
        />
      </section>
    </div>
  );
}
