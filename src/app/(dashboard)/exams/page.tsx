import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function ExamsPage() {
  const profile = await requireProfile();
  const supabase = createClient();
  const { data: exams } = await supabase
    .from("exams")
    .select("id, title, exam_date, max_marks, class_id, classes(name)")
    .order("exam_date", { ascending: false, nullsFirst: false });

  const canCreate = ["teacher", "coordinator", "principal"].includes(profile.role);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Exams"
        subtitle="Schedule exams and record marks."
        action={
          canCreate ? (
            <Link
              href="/exams/new"
              className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 hover:bg-vip-emeraldDark"
            >
              + Schedule exam
            </Link>
          ) : undefined
        }
      />

      {(exams ?? []).length === 0 ? (
        <EmptyState title="No exams scheduled" body={canCreate ? "Schedule the first one." : "Stay tuned."} />
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(exams as any[]).map((e) => (
            <li key={e.id}>
              <Link
                href={canCreate ? `/exams/${e.id}` : "/list/results"}
                className="block rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-5 hover:border-vip-emerald/30 transition"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-vip-muted dark:text-zinc-500">
                  {e.classes?.name ?? "—"}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{e.title}</h3>
                <div className="mt-2 text-xs text-vip-muted dark:text-zinc-500">
                  {e.exam_date && <>📅 {e.exam_date}</>} · max {e.max_marks ?? 100}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
