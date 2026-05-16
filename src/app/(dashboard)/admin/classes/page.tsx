import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function ClassesPage() {
  await requireRole(["admin", "principal", "coordinator"]);
  const supabase = createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade, capacity, class_teacher_id, profiles:class_teacher_id(full_name)")
    .order("grade", { ascending: true });

  // Student counts per class
  const { data: counts } = await supabase
    .from("students")
    .select("class_id");
  const tally = new Map<string, number>();
  for (const r of counts ?? []) {
    if (r.class_id) tally.set(r.class_id, (tally.get(r.class_id) ?? 0) + 1);
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Classes" subtitle="Manage rosters, class teachers, and subject assignments." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(classes ?? []).map((c: any) => {
          const enrolled = tally.get(c.id) ?? 0;
          const fillPct = c.capacity ? Math.round((enrolled / c.capacity) * 100) : 0;
          return (
            <Link
              key={c.id}
              href={`/admin/classes/${c.id}`}
              className="block rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6 hover:border-vip-emerald/30 hover:shadow-soft transition"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.18em] text-vip-muted dark:text-zinc-500">
                  Grade {c.grade}
                </div>
                <span className="text-xs font-semibold text-vip-emerald">{enrolled}/{c.capacity ?? 30}</span>
              </div>
              <h3 className="mt-3 text-xl font-bold">{c.name}</h3>
              <div className="mt-3 h-1.5 rounded-full bg-vip-emerald/10 overflow-hidden">
                <div
                  className="h-full bg-vip-emerald"
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>
              <div className="mt-4 text-sm text-vip-muted dark:text-zinc-400">
                Class teacher: <span className="text-vip-ink dark:text-zinc-200 font-medium">{c.profiles?.full_name ?? "Unassigned"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
