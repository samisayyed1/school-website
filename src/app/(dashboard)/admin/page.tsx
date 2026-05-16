import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function AdminPage() {
  const profile = await requireRole(["admin"]);
  const supabase = createClient();

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: totalParents },
    { count: totalClasses },
    { count: pendingFees },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "parent"),
    supabase.from("classes").select("*", { count: "exact", head: true }),
    supabase.from("fees").select("*", { count: "exact", head: true }).eq("paid", false),
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Welcome, ${profile.full_name.split(" ")[0]}`}
        subtitle="Administrator overview — accounts, fees, and system."
        action={
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-vip-emeraldDark transition"
          >
            + Create User
          </Link>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Students" value={totalStudents ?? 0} icon={<IconStudent />} />
        <StatCard label="Teachers" value={totalTeachers ?? 0} icon={<IconTeacher />} />
        <StatCard label="Parents" value={totalParents ?? 0} icon={<IconParent />} />
        <StatCard label="Classes" value={totalClasses ?? 0} hint="Classes 1 – 5" icon={<IconClass />} />
        <StatCard
          label="Unpaid Fees"
          value={pendingFees ?? 0}
          accent="gold"
          hint="Open invoices"
          icon={<IconRupee />}
        />
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent users</h2>
            <Link href="/admin/users" className="text-sm font-medium text-vip-emerald hover:text-vip-emeraldDark">
              View all →
            </Link>
          </div>
          {(recentUsers ?? []).length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No users yet"
                body="Create your first user to get started."
                cta={
                  <Link href="/admin/users/new" className="text-sm font-semibold text-vip-emerald">
                    Create user →
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-vip-emerald/5 dark:divide-zinc-800">
              {(recentUsers ?? []).map((u) => (
                <li key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.full_name}</div>
                    <div className="text-xs text-vip-muted dark:text-zinc-500">{u.email}</div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-vip-emerald/10 dark:bg-vip-emerald/20 text-vip-emerald px-2.5 py-0.5 text-xs font-semibold">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
          <h2 className="font-semibold">Quick actions</h2>
          <ul className="mt-4 space-y-2">
            <QuickLink href="/admin/users/new" label="Create new user" />
            <QuickLink href="/admin/users" label="Manage users" />
            <QuickLink href="/list/fees" label="View fees" />
            <QuickLink href="/list/announcements" label="Announcements" />
            <QuickLink href="/list/events" label="Events" />
          </ul>
        </div>
      </section>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between rounded-xl border border-vip-emerald/10 dark:border-zinc-800 px-4 py-3 text-sm font-medium hover:bg-vip-emerald/5 dark:hover:bg-zinc-800 transition"
      >
        <span>{label}</span>
        <span className="text-vip-emerald">→</span>
      </Link>
    </li>
  );
}

function IconStudent() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 9l10-4 10 4-10 4L2 9Z" />
      <path d="M6 11v4c2 2 10 2 12 0v-4" />
    </svg>
  );
}
function IconTeacher() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3V5Z" />
      <path d="M21 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8V5Z" />
    </svg>
  );
}
function IconParent() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 21c.7-3.5 3.5-5.5 6.5-5.5s5.8 2 6.5 5.5" />
      <circle cx="17" cy="9" r="2.8" />
      <path d="M21.5 19.5c-.5-2.5-2.3-4-4.5-4" />
    </svg>
  );
}
function IconClass() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21V7l9-4 9 4v14" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function IconRupee() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6h12M6 10h12M9 10c4 0 4 6 0 6h-3l9 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
