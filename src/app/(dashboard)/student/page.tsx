import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function StudentPage() {
  const profile = await requireRole(["student"]);
  const supabase = createClient();

  const [
    { data: student },
    { data: attendance },
    { data: results },
    { data: homework },
    { data: announcements },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("admission_no, class_id, classes(name, grade)")
      .eq("profile_id", profile.id)
      .maybeSingle(),
    supabase
      .from("attendance")
      .select("status, date")
      .eq("student_id", profile.id)
      .order("date", { ascending: false })
      .limit(30),
    supabase
      .from("results")
      .select("id, marks_obtained, grade, subjects(name), exams(title, exam_date)")
      .eq("student_id", profile.id)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("assignments_with_class")
      .select("id, title, subject_name, due_date")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(5),
    supabase
      .from("announcements")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const presentCount = (attendance ?? []).filter((a) => a.status === "present").length;
  const totalCount = attendance?.length ?? 0;
  const pct = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Hello, ${profile.full_name.split(" ")[0]}`}
        subtitle={
          student?.classes
            ? `${(student.classes as any).name} · Admission #${student.admission_no}`
            : "Welcome to VIP School portal"
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attendance" value={`${pct}%`} hint={`${presentCount}/${totalCount} days`} accent="emerald" />
        <StatCard label="Recent results" value={results?.length ?? 0} hint="published" accent="gold" />
        <StatCard label="Homework due" value={homework?.length ?? 0} />
        <StatCard label="Announcements" value={announcements?.length ?? 0} accent="neutral" />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
          <h2 className="font-semibold">Upcoming homework</h2>
          {(homework ?? []).length === 0 ? (
            <div className="mt-4"><EmptyState title="No homework right now" body="Your teachers will post here." /></div>
          ) : (
            <ul className="mt-4 divide-y divide-vip-emerald/5 dark:divide-zinc-800">
              {(homework ?? []).map((h: any) => (
                <li key={h.id} className="py-3">
                  <div className="font-medium">{h.title}</div>
                  <div className="text-xs text-vip-muted dark:text-zinc-500">
                    {h.subject_name} {h.due_date && `· due ${h.due_date}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
          <h2 className="font-semibold">Recent results</h2>
          {(results ?? []).length === 0 ? (
            <div className="mt-4"><EmptyState title="No results yet" body="Results appear here once published by your teachers." /></div>
          ) : (
            <ul className="mt-4 divide-y divide-vip-emerald/5 dark:divide-zinc-800">
              {(results ?? []).map((r: any) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.exams?.title}</div>
                    <div className="text-xs text-vip-muted dark:text-zinc-500">{r.subjects?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-vip-emerald">{r.marks_obtained ?? "—"}</div>
                    <div className="text-xs text-vip-muted dark:text-zinc-500">{r.grade ?? ""}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {(announcements ?? []).length > 0 && (
        <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
          <h2 className="font-semibold">Announcements</h2>
          <ul className="mt-4 space-y-3">
            {(announcements ?? []).map((a) => (
              <li key={a.id} className="rounded-xl bg-vip-emerald/5 dark:bg-zinc-800/60 p-4">
                <div className="font-medium">{a.title}</div>
                {a.body && (
                  <p className="mt-1 text-sm text-vip-muted dark:text-zinc-300">{a.body}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="text-center">
        <Link href="/homework" className="text-sm font-semibold text-vip-emerald hover:text-vip-emeraldDark">
          View all homework →
        </Link>
      </div>
    </div>
  );
}
