import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { markFeePaid } from "./actions";

export default async function FeesPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: fees } = await supabase
    .from("fees")
    .select("id, student_id, description, amount, due_date, paid, paid_at, payment_ref, profiles:student_id(full_name)")
    .order("due_date", { ascending: true, nullsFirst: false });

  const total = (fees ?? []).reduce((a, f: any) => a + Number(f.amount ?? 0), 0);
  const paid = (fees ?? []).filter((f: any) => f.paid).reduce((a, f: any) => a + Number(f.amount ?? 0), 0);
  const unpaid = total - paid;
  const isStaff = ["admin", "principal"].includes(profile.role);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Fees"
        subtitle={isStaff ? "All school invoices and payments." : "Your invoices and payment status."}
        action={
          isStaff ? (
            <Link
              href="/admin/fees/new"
              className="inline-flex items-center gap-2 rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 hover:bg-vip-emeraldDark"
            >
              + Add fee
            </Link>
          ) : undefined
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total billed" value={`₹${total.toLocaleString("en-IN")}`} />
        <StatCard label="Collected" value={`₹${paid.toLocaleString("en-IN")}`} accent="emerald" />
        <StatCard label="Outstanding" value={`₹${unpaid.toLocaleString("en-IN")}`} accent="gold" />
      </section>

      {(fees ?? []).length === 0 ? (
        <EmptyState
          title={isStaff ? "No fee records yet" : "You have no fees on record"}
          body={isStaff ? "Click 'Add fee' to create the first one." : "You're all up to date."}
        />
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500 border-b border-vip-emerald/10 dark:border-zinc-800">
              <tr>
                {isStaff && <th className="px-5 py-3">Student</th>}
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Status</th>
                {isStaff && <th className="px-5 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {(fees as any[]).map((f) => (
                <tr key={f.id} className="border-b border-vip-emerald/5 dark:border-zinc-800/60 last:border-0">
                  {isStaff && <td className="px-5 py-3 font-medium">{f.profiles?.full_name ?? "—"}</td>}
                  <td className="px-5 py-3">{f.description}</td>
                  <td className="px-5 py-3 font-semibold">₹{Number(f.amount).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-vip-muted dark:text-zinc-400">{f.due_date ?? "—"}</td>
                  <td className="px-5 py-3">
                    {f.paid ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
                        Paid {f.paid_at ? `· ${new Date(f.paid_at).toLocaleDateString()}` : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2.5 py-0.5 text-xs font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                  {isStaff && (
                    <td className="px-5 py-3 text-right">
                      {!f.paid && (
                        <form action={markFeePaid.bind(null, f.id, null)}>
                          <button className="text-xs font-semibold text-vip-emerald hover:text-vip-emeraldDark">
                            Mark paid
                          </button>
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
