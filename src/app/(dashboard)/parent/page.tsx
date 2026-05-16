import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function ParentPage() {
  const profile = await requireRole(["parent"]);
  const supabase = createClient();

  // All children of this parent
  const { data: children } = await supabase
    .from("students")
    .select("profile_id, admission_no, class_id, classes(name, grade), profiles(full_name)")
    .eq("parent_id", profile.id);

  const childIds = (children ?? []).map((c: any) => c.profile_id);
  const [attendance, fees, results, homework] = await Promise.all([
    childIds.length
      ? supabase.from("attendance").select("student_id, status").in("student_id", childIds)
      : Promise.resolve({ data: [] as any[] }),
    childIds.length
      ? supabase.from("fees").select("student_id, amount, paid").in("student_id", childIds)
      : Promise.resolve({ data: [] as any[] }),
    childIds.length
      ? supabase
          .from("results")
          .select("id, marks_obtained, grade, student_id, subjects(name), exams(title)")
          .in("student_id", childIds)
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as any[] }),
    childIds.length
      ? supabase
          .from("assignments_with_class")
          .select("id, title, subject_name, due_date, class_id")
          .order("due_date", { ascending: true, nullsFirst: false })
          .limit(5)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const unpaid = (fees.data ?? []).filter((f) => !f.paid);
  const unpaidAmount = unpaid.reduce((a, f) => a + Number(f.amount ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`As-salāmu ʿalaykum, ${profile.full_name.split(" ")[0]}`}
        subtitle={
          (children ?? []).length
            ? `Following ${children!.length} child${children!.length > 1 ? "ren" : ""}`
            : "Welcome — your children's records will appear here once linked."
        }
      />

      {(children ?? []).length === 0 ? (
        <EmptyState
          title="No children linked yet"
          body="Contact the school office to link your child(ren) to your account."
        />
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Children" value={children!.length} icon={<IconParent />} />
            <StatCard
              label="Total attendance"
              value={
                attendance.data?.length
                  ? `${Math.round(
                      ((attendance.data as any[]).filter((a) => a.status === "present").length /
                        attendance.data.length) *
                        100
                    )}%`
                  : "—"
              }
            />
            <StatCard
              label="Outstanding fees"
              value={unpaidAmount ? `₹${unpaidAmount.toLocaleString("en-IN")}` : "₹0"}
              accent="gold"
              hint={`${unpaid.length} pending`}
            />
            <StatCard label="Homework due" value={homework.data?.length ?? 0} accent="neutral" />
          </section>

          <section className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
              <h2 className="font-semibold">Your children</h2>
              <ul className="mt-4 space-y-3">
                {(children ?? []).map((c: any) => (
                  <li key={c.profile_id} className="flex items-center justify-between rounded-xl border border-vip-emerald/10 dark:border-zinc-800 px-4 py-3">
                    <div>
                      <div className="font-medium">{c.profiles?.full_name}</div>
                      <div className="text-xs text-vip-muted dark:text-zinc-500">
                        {c.classes?.name} · Adm #{c.admission_no}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
              <h2 className="font-semibold">Recent results</h2>
              {(results.data ?? []).length === 0 ? (
                <div className="mt-4"><EmptyState title="No published results yet" /></div>
              ) : (
                <ul className="mt-4 divide-y divide-vip-emerald/5 dark:divide-zinc-800">
                  {(results.data as any[]).map((r) => (
                    <li key={r.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.exams?.title}</div>
                        <div className="text-xs text-vip-muted dark:text-zinc-500">
                          {r.subjects?.name}
                        </div>
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

          <div className="flex flex-wrap gap-3">
            <Link href="/list/fees" className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 hover:bg-vip-emeraldDark">
              View fees
            </Link>
            <Link href="/homework" className="inline-flex items-center gap-2 rounded-full border border-vip-emerald/20 text-vip-emerald text-sm font-semibold px-5 py-2.5 hover:bg-vip-emerald/5">
              View homework
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function IconParent() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 21c.7-3.5 3.5-5.5 6.5-5.5s5.8 2 6.5 5.5" />
      <circle cx="17" cy="9" r="2.8" />
      <path d="M21.5 19.5c-.5-2.5-2.3-4-4.5-4" />
    </svg>
  );
}
