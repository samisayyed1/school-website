import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";
import { saveAttendance } from "./actions";

export default async function MarkAttendancePage({
  searchParams,
}: {
  searchParams: { date?: string; class?: string };
}) {
  const profile = await requireRole(["teacher", "coordinator", "principal"]);
  const supabase = createClient();
  const date = searchParams.date ?? new Date().toISOString().slice(0, 10);

  // Eligible classes:
  // teacher → classes they're assigned to (RLS handles it via class_assignments)
  // coordinator/principal → all classes
  let classes: { id: string; name: string }[] = [];
  if (profile.role === "teacher") {
    const { data } = await supabase
      .from("class_assignments")
      .select("classes(id, name)")
      .eq("teacher_id", profile.id);
    const seen = new Set<string>();
    classes = (data ?? [])
      .map((r: any) => r.classes)
      .filter((c: any) => c && !seen.has(c.id) && seen.add(c.id));
  } else {
    const { data } = await supabase.from("classes").select("id, name").order("grade");
    classes = data ?? [];
  }

  const selectedClass = searchParams.class ?? classes[0]?.id;

  // Roster + today's existing attendance for prefill.
  let roster: any[] = [];
  let existing: Record<string, string> = {};
  if (selectedClass) {
    const { data: r } = await supabase
      .from("students")
      .select("profile_id, profiles(full_name)")
      .eq("class_id", selectedClass);
    roster = r ?? [];

    const { data: e } = await supabase
      .from("attendance")
      .select("student_id, status")
      .eq("date", date)
      .in(
        "student_id",
        roster.map((x) => x.profile_id)
      );
    for (const row of e ?? []) existing[row.student_id] = row.status;
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/list/attendance" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Attendance
      </Link>
      <PageHeader title="Mark attendance" subtitle={`${date}`} />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500">Date</span>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="mt-1 rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500">Class</span>
          <select
            name="class"
            defaultValue={selectedClass}
            className="mt-1 rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5">
          Load roster
        </button>
      </form>

      {!selectedClass || roster.length === 0 ? (
        <EmptyState
          title={classes.length === 0 ? "No classes available" : "No students in this class yet"}
          body={
            classes.length === 0
              ? "An admin needs to assign you to a class first."
              : "Admin needs to enroll students in this class."
          }
        />
      ) : (
        <form action={saveAttendance} className="space-y-4">
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="class" value={selectedClass} />

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500 border-b border-vip-emerald/10 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s: any) => (
                  <tr key={s.profile_id} className="border-b border-vip-emerald/5 dark:border-zinc-800/60 last:border-0">
                    <td className="px-5 py-3 font-medium">{s.profiles?.full_name}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {(["present", "absent", "late"] as const).map((opt) => (
                          <label
                            key={opt}
                            className="inline-flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                          >
                            <input
                              type="radio"
                              name={`status_${s.profile_id}`}
                              value={opt}
                              defaultChecked={(existing[s.profile_id] ?? "present") === opt}
                              className="accent-vip-emerald"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark"
          >
            Save attendance
          </button>
        </form>
      )}
    </div>
  );
}
