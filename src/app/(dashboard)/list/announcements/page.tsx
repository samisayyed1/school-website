import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function AnnouncementsPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, target_role, created_at, profiles:created_by(full_name)")
    .order("created_at", { ascending: false });

  const canPost = ["teacher", "coordinator", "principal", "admin"].includes(profile.role);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Important updates from the school."
        action={
          canPost ? (
            <Link
              href="/list/announcements/new"
              className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-vip-emeraldDark"
            >
              + New announcement
            </Link>
          ) : undefined
        }
      />

      {(data ?? []).length === 0 ? (
        <EmptyState title="No announcements yet" body={canPost ? "Post the first one." : "Stay tuned."} />
      ) : (
        <ul className="space-y-3">
          {(data as any[]).map((a) => (
            <li
              key={a.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-lg">{a.title}</h3>
                {a.target_role && (
                  <span className="text-xs uppercase tracking-wider rounded-full bg-vip-emerald/10 text-vip-emerald px-2.5 py-0.5">
                    {a.target_role}
                  </span>
                )}
              </div>
              {a.body && (
                <p className="mt-2 text-sm text-vip-muted dark:text-zinc-300 whitespace-pre-wrap">{a.body}</p>
              )}
              <div className="mt-3 text-xs text-vip-muted dark:text-zinc-500">
                {a.profiles?.full_name ?? "—"} · {new Date(a.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
