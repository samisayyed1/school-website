import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";
import {
  enrollStudent,
  unenrollStudent,
  setClassTeacher,
  addTeacherAssignment,
  removeTeacherAssignment,
  linkParent,
} from "./actions";

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  await requireRole(["admin", "principal", "coordinator"]);
  const supabase = createClient();

  const { data: cls } = await supabase
    .from("classes")
    .select("id, name, grade, capacity, class_teacher_id")
    .eq("id", params.id)
    .single();
  if (!cls) notFound();

  // Concurrent fetches
  const [
    rosterRes,
    teacherListRes,
    assignmentsRes,
    subjectsRes,
    unenrolledRes,
    parentsRes,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("profile_id, admission_no, parent_id, profiles:profile_id(full_name)")
      .eq("class_id", params.id),
    supabase.from("profiles").select("id, full_name").eq("role", "teacher").order("full_name"),
    supabase
      .from("class_assignments")
      .select("id, teacher_id, subject_id, profiles:teacher_id(full_name), subjects(name)")
      .eq("class_id", params.id),
    supabase.from("subjects").select("id, name").order("name"),
    supabase
      .from("students")
      .select("profile_id, admission_no, profiles:profile_id(full_name)")
      .is("class_id", null),
    supabase.from("profiles").select("id, full_name, email").eq("role", "parent").order("full_name"),
  ]);

  const roster = rosterRes.data ?? [];
  const teachers = teacherListRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];
  const subjects = subjectsRes.data ?? [];
  const unenrolled = unenrolledRes.data ?? [];
  const parents = parentsRes.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <Link href="/admin/classes" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Classes
      </Link>
      <PageHeader
        title={cls.name}
        subtitle={`Grade ${cls.grade} · ${roster.length}/${cls.capacity} enrolled`}
      />

      {/* Class teacher */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
        <h2 className="font-semibold">Class teacher</h2>
        <form action={setClassTeacher.bind(null, params.id)} className="mt-3 flex flex-wrap items-center gap-3">
          <select
            name="teacher_id"
            defaultValue={cls.class_teacher_id ?? ""}
            className="rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm"
          >
            <option value="">— Unassigned —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
          <button className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 hover:bg-vip-emeraldDark">
            Save
          </button>
        </form>
      </section>

      {/* Subject teacher assignments */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
        <h2 className="font-semibold">Subject teachers</h2>
        <p className="mt-1 text-xs text-vip-muted dark:text-zinc-500">
          {"Teachers can only see/edit data for classes they're assigned to."}
        </p>

        {assignments.length === 0 ? (
          <div className="mt-4"><EmptyState title="No subject teachers yet" /></div>
        ) : (
          <ul className="mt-4 divide-y divide-vip-emerald/5 dark:divide-zinc-800">
            {assignments.map((a: any) => (
              <li key={a.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.profiles?.full_name}</div>
                  <div className="text-xs text-vip-muted dark:text-zinc-500">{a.subjects?.name}</div>
                </div>
                <form action={removeTeacherAssignment.bind(null, params.id)}>
                  <input type="hidden" name="assignment_id" value={a.id} />
                  <button className="text-xs text-red-600 hover:text-red-700 font-semibold">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={addTeacherAssignment.bind(null, params.id)} className="mt-4 flex flex-wrap gap-3">
          <select
            name="teacher_id"
            required
            className="flex-1 min-w-[160px] rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm"
          >
            <option value="">Teacher…</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
          <select
            name="subject_id"
            required
            className="flex-1 min-w-[160px] rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm"
          >
            <option value="">Subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 hover:bg-vip-emeraldDark">
            + Assign
          </button>
        </form>
      </section>

      {/* Roster */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
        <h2 className="font-semibold">Roster ({roster.length})</h2>

        {roster.length === 0 ? (
          <div className="mt-4"><EmptyState title="No students in this class yet" /></div>
        ) : (
          <ul className="mt-4 divide-y divide-vip-emerald/5 dark:divide-zinc-800">
            {roster.map((s: any) => (
              <li key={s.profile_id} className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-4">
                  <div className="font-medium">{s.profiles?.full_name}</div>
                  <div className="text-xs text-vip-muted dark:text-zinc-500">{s.admission_no}</div>
                </div>
                <form action={linkParent.bind(null, params.id)} className="sm:col-span-6 flex gap-2">
                  <input type="hidden" name="student_id" value={s.profile_id} />
                  <select
                    name="parent_id"
                    defaultValue={s.parent_id ?? ""}
                    className="flex-1 rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                  >
                    <option value="">— No parent linked —</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                    ))}
                  </select>
                  <button className="text-xs font-semibold text-vip-emerald hover:text-vip-emeraldDark">
                    Save
                  </button>
                </form>
                <form action={unenrollStudent.bind(null, params.id)} className="sm:col-span-2 text-right">
                  <input type="hidden" name="student_id" value={s.profile_id} />
                  <button className="text-xs text-red-600 hover:text-red-700 font-semibold">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 pt-4 border-t border-vip-emerald/10 dark:border-zinc-800">
          <h3 className="text-sm font-semibold">Enroll a student</h3>
          {unenrolled.length === 0 ? (
            <p className="mt-2 text-xs text-vip-muted dark:text-zinc-500">
              No unassigned students. Create one at <Link href="/admin/users/new" className="text-vip-emerald">/admin/users/new</Link>.
            </p>
          ) : (
            <form action={enrollStudent.bind(null, params.id)} className="mt-3 flex gap-3">
              <select
                name="student_id"
                required
                className="flex-1 rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm"
              >
                <option value="">Choose student…</option>
                {unenrolled.map((s: any) => (
                  <option key={s.profile_id} value={s.profile_id}>
                    {s.profiles?.full_name} ({s.admission_no})
                  </option>
                ))}
              </select>
              <button className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 hover:bg-vip-emeraldDark">
                + Enroll
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
