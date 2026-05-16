import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function TeacherPage() {
  const profile = await requireRole(["teacher"]);
  const supabase = createClient();

  // Classes this teacher is assigned to (RLS scopes naturally).
  const { data: assignments } = await supabase
    .from("class_assignments")
    .select("class_id, classes(name, grade), subjects(name)")
    .eq("teacher_id", profile.id);

  // Students in those classes.
  const classIds = (assignments ?? []).map((a: any) => a.class_id);
  const { count: studentCount } = classIds.length
    ? await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .in("class_id", classIds)
    : { count: 0 };

  const { data: recentHomework } = await supabase
    .from("assignments_with_class")
    .select("id, title, class_name, due_date, created_at")
    .eq("created_by", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const uniqueClasses = new Set(classIds);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Assalāmu ʿalaykum, ${profile.full_name.split(" ")[0]}`}
        subtitle="Your classes, your students, your day."
        action={
          <Link
            href="/homework/new"
            className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-vip-emeraldDark transition"
          >
            + Post Homework
          </Link>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My classes" value={uniqueClasses.size} hint="Assigned to you" />
        <StatCard label="My students" value={studentCount ?? 0} />
        <StatCard label="Subjects" value={new Set((assignments ?? []).map((a: any) => a.subjects?.name)).size} />
        <StatCard label="Homework posted" value={recentHomework?.length ?? 0} accent="gold" />
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
          <h2 className="font-semibold">My class assignments</h2>
          {(assignments ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No classes assigned yet"
                body="An admin or principal needs to assign you to a class + subject."
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {(assignments ?? []).map((a: any, i) => (
                <li
                  key={`${a.class_id}-${i}`}
                  className="flex items-center justify-between rounded-xl border border-vip-emerald/10 dark:border-zinc-800 px-4 py-3 text-sm"
                >
                  <span className="font-medium">{a.classes?.name}</span>
                  <span className="text-vip-muted dark:text-zinc-400">{a.subjects?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent homework</h2>
            <Link href="/homework" className="text-sm font-medium text-vip-emerald hover:text-vip-emeraldDark">
              All homework →
            </Link>
          </div>
          {(recentHomework ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No homework yet"
                body="Post your first homework with notes, PDFs, or images."
                cta={
                  <Link href="/homework/new" className="text-sm font-semibold text-vip-emerald">
                    Post homework →
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-vip-emerald/5 dark:divide-zinc-800">
              {(recentHomework ?? []).map((h) => (
                <li key={h.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link href={`/homework`} className="font-medium hover:text-vip-emerald">
                      {h.title}
                    </Link>
                    <div className="text-xs text-vip-muted dark:text-zinc-500">
                      {h.class_name} {h.due_date && `· due ${h.due_date}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
