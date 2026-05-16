import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function EventsPage() {
  const profile = await requireProfile();
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, description, start_at, end_at, location, profiles:created_by(full_name)")
    .order("start_at", { ascending: true });

  const canPost = ["teacher", "coordinator", "principal", "admin"].includes(profile.role);
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Events"
        subtitle="Holidays, exams, ceremonies, and school activities."
        action={
          canPost ? (
            <Link
              href="/list/events/new"
              className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 hover:bg-vip-emeraldDark"
            >
              + Add event
            </Link>
          ) : undefined
        }
      />
      {(data ?? []).length === 0 ? (
        <EmptyState title="No events scheduled" />
      ) : (
        <ul className="space-y-3">
          {(data as any[]).map((e) => (
            <li
              key={e.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{e.title}</h3>
                  {e.description && (
                    <p className="mt-1 text-sm text-vip-muted dark:text-zinc-300">{e.description}</p>
                  )}
                  <div className="mt-2 text-xs text-vip-muted dark:text-zinc-500 flex flex-wrap gap-3">
                    <span>📅 {new Date(e.start_at).toLocaleString()}</span>
                    {e.location && <span>📍 {e.location}</span>}
                    <span>by {e.profiles?.full_name ?? "—"}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
