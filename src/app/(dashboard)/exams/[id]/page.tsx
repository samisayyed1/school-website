import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";
import { saveMarks } from "./actions";

export default async function ExamMarksPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { subject?: string };
}) {
  const profile = await requireRole(["teacher", "coordinator", "principal"]);
  const supabase = createClient();

  const { data: exam } = await supabase
    .from("exams")
    .select("id, title, class_id, exam_date, max_marks, classes(name)")
    .eq("id", params.id)
    .single();
  if (!exam) notFound();

  // Subjects this teacher teaches in the exam's class (RLS scopes naturally for teachers).
  let subjects: { id: string; name: string }[] = [];
  if (profile.role === "teacher") {
    const { data } = await supabase
      .from("class_assignments")
      .select("subjects(id, name)")
      .eq("teacher_id", profile.id)
      .eq("class_id", exam.class_id);
    const seen = new Set<string>();
    subjects = (data ?? [])
      .map((r: any) => r.subjects)
      .filter((s: any) => s && !seen.has(s.id) && seen.add(s.id));
  } else {
    const { data } = await supabase.from("subjects").select("id, name").order("name");
    subjects = data ?? [];
  }

  const subjectId = searchParams.subject ?? subjects[0]?.id;

  // Roster in this class
  const { data: roster } = await supabase
    .from("students")
    .select("profile_id, profiles:profile_id(full_name)")
    .eq("class_id", exam.class_id);

  // Existing marks for this subject
  let existing: Record<string, { marks: number | null; published: boolean }> = {};
  if (subjectId) {
    const { data: prev } = await supabase
      .from("results")
      .select("student_id, marks_obtained, published")
      .eq("exam_id", params.id)
      .eq("subject_id", subjectId);
    for (const r of prev ?? []) {
      existing[r.student_id] = { marks: r.marks_obtained, published: r.published };
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/exams" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Exams
      </Link>
      <PageHeader
        title={exam.title}
        subtitle={`${(exam as any).classes?.name} · max ${exam.max_marks ?? 100} marks ${exam.exam_date ? `· ${exam.exam_date}` : ""}`}
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500">Subject</span>
          <select
            name="subject"
            defaultValue={subjectId}
            className="mt-1 rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
          >
            <option value="">Choose subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <button className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5">
          Load roster
        </button>
      </form>

      {!subjectId ? (
        <EmptyState title="Choose a subject to enter marks" />
      ) : (roster ?? []).length === 0 ? (
        <EmptyState title="No students in this class yet" body="Enroll students in this class first." />
      ) : (
        <form action={saveMarks.bind(null, params.id)} className="space-y-4">
          <input type="hidden" name="subject_id" value={subjectId} />

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500 border-b border-vip-emerald/10 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Marks (of {exam.max_marks ?? 100})</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(roster ?? []).map((s: any) => {
                  const e = existing[s.profile_id];
                  return (
                    <tr key={s.profile_id} className="border-b border-vip-emerald/5 dark:border-zinc-800/60 last:border-0">
                      <td className="px-5 py-3 font-medium">{s.profiles?.full_name}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          name={`marks_${s.profile_id}`}
                          min={0}
                          max={exam.max_marks ?? 100}
                          step="0.5"
                          defaultValue={e?.marks ?? ""}
                          className="w-24 rounded-lg border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {e?.published ? (
                          <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Published</span>
                        ) : e ? (
                          <span className="text-amber-700 dark:text-amber-300 font-semibold">Draft</span>
                        ) : (
                          <span className="text-vip-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="publish" className="accent-vip-emerald" />
              Publish to students & parents now (sends notifications)
            </label>
          </div>

          <button className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark">
            Save marks
          </button>
        </form>
      )}
    </div>
  );
}
