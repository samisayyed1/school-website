import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function HomeworkListPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  // RLS handles scoping — teacher sees their own, students/parents see their class's homework.
  const { data: homework } = await supabase
    .from("assignments_with_class")
    .select(
      "id, title, description, due_date, attachment_url, attachment_name, class_name, subject_name, teacher_name, created_at"
    )
    .order("created_at", { ascending: false });

  const canPost = ["teacher", "coordinator", "principal", "admin"].includes(profile.role);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Homework"
        subtitle={canPost ? "Post homework with notes, PDFs, or images." : "Your assignments and class notes."}
        action={
          canPost ? (
            <Link
              href="/homework/new"
              className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-vip-emeraldDark transition"
            >
              + Post Homework
            </Link>
          ) : undefined
        }
      />

      {(homework ?? []).length === 0 ? (
        <EmptyState
          title="No homework yet"
          body={canPost ? "Click 'Post Homework' to create the first one." : "Check back soon — your teachers will post here."}
        />
      ) : (
        <ul className="space-y-3">
          {(homework ?? []).map((h: any) => (
            <li
              key={h.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-vip-emerald/10 text-vip-emerald px-2 py-0.5 font-semibold">
                      {h.class_name ?? "—"}
                    </span>
                    <span className="rounded-full bg-vip-gold/10 text-vip-gold px-2 py-0.5 font-semibold">
                      {h.subject_name ?? "—"}
                    </span>
                    {h.due_date && (
                      <span className="text-vip-muted dark:text-zinc-500">
                        Due {h.due_date}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{h.title}</h3>
                  {h.description && (
                    <p className="mt-1.5 text-sm text-vip-muted dark:text-zinc-300 whitespace-pre-wrap">
                      {h.description}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-vip-muted dark:text-zinc-500">
                    by {h.teacher_name ?? "—"}
                  </div>
                </div>
                {h.attachment_url && (
                  <a
                    href={h.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-vip-emerald/20 px-4 py-2 text-sm font-semibold text-vip-emerald hover:bg-vip-emerald/5"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {h.attachment_name ?? "Download"}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
