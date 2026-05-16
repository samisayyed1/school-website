import Link from "next/link";
import { requireRole, ROLE_LABEL } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function UsersPage() {
  await requireRole(["admin", "principal"]);
  const supabase = createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,phone,notification_email,notification_phone,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
            {users?.length ?? 0} accounts · students, parents, teachers, staff
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-vip-emeraldDark transition"
        >
          + Create User
        </Link>
      </header>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500 border-b border-vip-emerald/10 dark:border-zinc-800">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Login email</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Notify email</th>
              <th className="px-5 py-3 font-semibold">Notify phone</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr
                key={u.id}
                className="border-b border-vip-emerald/5 dark:border-zinc-800/60 last:border-0 hover:bg-vip-emerald/5 dark:hover:bg-zinc-800/40"
              >
                <td className="px-5 py-3 font-medium">{u.full_name}</td>
                <td className="px-5 py-3 text-vip-muted dark:text-zinc-400">{u.email}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-full bg-vip-emerald/10 text-vip-emerald dark:bg-vip-emerald/20 px-2.5 py-0.5 text-xs font-semibold">
                    {ROLE_LABEL[u.role as keyof typeof ROLE_LABEL]}
                  </span>
                </td>
                <td className="px-5 py-3 text-vip-muted dark:text-zinc-400">{u.notification_email ?? "—"}</td>
                <td className="px-5 py-3 text-vip-muted dark:text-zinc-400">{u.notification_phone ?? "—"}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/users/${u.id}`} className="text-vip-emerald font-semibold hover:text-vip-emeraldDark">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-vip-muted">
                  No users yet. Click <strong>Create User</strong> to add the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
