import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const profile = await requireProfile();
  const supabase = createClient();

  const canMark = ["teacher", "coordinator", "principal"].includes(profile.role);
  const date = searchParams.date ?? new Date().toISOString().slice(0, 10);

  // For students/parents, show recent attendance (RLS naturally scopes it).
  if (profile.role === "student" || profile.role === "parent") {
    const { data: rows } = await supabase
      .from("attendance")
      .select("date, status, student_id")
      .order("date", { ascending: false })
      .limit(60);
    const present = (rows ?? []).filter((r) => r.status === "present").length;
    const pct = rows?.length ? Math.round((present / rows.length) * 100) : 0;

    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Attendance" subtitle={`Overall: ${pct}% present (${rows?.length ?? 0} records)`} />
        {(rows ?? []).length === 0 ? (
          <EmptyState title="No attendance records yet" />
        ) : (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500 border-b border-vip-emerald/10 dark:border-zinc-800">
                <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr>
              </thead>
              <tbody>
                {(rows ?? []).map((r, i) => (
                  <tr key={i} className="border-b border-vip-emerald/5 dark:border-zinc-800/60 last:border-0">
                    <td className="px-5 py-2.5">{r.date}</td>
                    <td className="px-5 py-2.5">
                      <StatusBadge status={r.status} />
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

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Attendance"
        subtitle={`Day: ${date}`}
        action={
          canMark ? (
            <Link
              href={`/list/attendance/mark?date=${date}`}
              className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 hover:bg-vip-emeraldDark"
            >
              Mark attendance →
            </Link>
          ) : undefined
        }
      />
      <EmptyState
        title="Attendance summary"
        body={`Use 'Mark attendance' to record today's roll for your class. Students/parents see their own records here automatically.`}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    absent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    late: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? "bg-zinc-200 text-zinc-700"}`}>
      {status}
    </span>
  );
}
