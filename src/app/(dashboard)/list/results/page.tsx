import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function ResultsPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  // RLS handles scoping:
  // - students see own published only
  // - parents see children published only
  // - teachers see their assigned students
  // - principal/coordinator see all
  const { data: results } = await supabase
    .from("results")
    .select(
      "id, marks_obtained, grade, published, remarks, profiles:student_id(full_name), subjects(name), exams(title, exam_date, max_marks)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const isStaff = ["teacher", "coordinator", "principal"].includes(profile.role);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Results"
        subtitle={isStaff ? "Exam results across your students." : "Your published exam results."}
      />
      {(results ?? []).length === 0 ? (
        <EmptyState title="No results yet" body="Once teachers grade and publish exams, they'll appear here." />
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500 border-b border-vip-emerald/10 dark:border-zinc-800">
              <tr>
                {isStaff && <th className="px-5 py-3">Student</th>}
                <th className="px-5 py-3">Exam</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Marks</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(results as any[]).map((r) => (
                <tr key={r.id} className="border-b border-vip-emerald/5 dark:border-zinc-800/60 last:border-0">
                  {isStaff && <td className="px-5 py-3 font-medium">{r.profiles?.full_name ?? "—"}</td>}
                  <td className="px-5 py-3">{r.exams?.title ?? "—"}</td>
                  <td className="px-5 py-3">{r.subjects?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold text-vip-emerald">
                    {r.marks_obtained ?? "—"}{r.exams?.max_marks ? ` / ${r.exams.max_marks}` : ""}
                  </td>
                  <td className="px-5 py-3">{r.grade ?? "—"}</td>
                  <td className="px-5 py-3">
                    {r.published ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 text-xs font-semibold">
                        Draft
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
