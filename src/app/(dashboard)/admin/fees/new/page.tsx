import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

async function createFee(formData: FormData) {
  "use server";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const student_id = String(formData.get("student_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const due_date = String(formData.get("due_date") ?? "") || null;

  if (!student_id || !description || !amount || amount <= 0) return;

  const { error } = await supabase.from("fees").insert({
    student_id,
    description,
    amount,
    due_date,
  });
  if (error) return;

  // Best-effort notification
  const { data: student } = await supabase
    .from("profiles")
    .select("notification_email, notification_phone, full_name")
    .eq("id", student_id)
    .single();
  if (student) {
    notify(
      { email: student.notification_email, phone: student.notification_phone },
      {
        subject: `New fee invoice — ₹${amount.toLocaleString("en-IN")}`,
        html: `<p>Dear ${student.full_name},</p><p>A new fee has been added: <strong>${description}</strong>, amount <strong>₹${amount.toLocaleString("en-IN")}</strong>${due_date ? `, due <strong>${due_date}</strong>` : ""}.</p><p>— The VIP School of Excellence</p>`,
        text: `New fee: ${description} ₹${amount}${due_date ? ` due ${due_date}` : ""}`,
        whatsapp: `VIP School: New fee ${description} ₹${amount}${due_date ? ` due ${due_date}` : ""}.`,
      }
    ).catch(() => {});
  }

  revalidatePath("/list/fees");
  redirect("/list/fees");
}

export default async function NewFeePage() {
  await requireRole(["admin", "principal"]);
  const supabase = createClient();
  const { data: students } = await supabase
    .from("students")
    .select("profile_id, admission_no, profiles:profile_id(full_name)")
    .order("admission_no");

  return (
    <div className="p-6">
      <Link href="/list/fees" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Fees
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Add fee</h1>
      <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
        Create an invoice for a student. They (and their parent) will get a notification if their channels are set.
      </p>

      <form action={createFee} className="mt-6 space-y-5 max-w-2xl">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
            Student <span className="text-red-500">*</span>
          </span>
          <select
            name="student_id"
            required
            className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
          >
            <option value="">Choose student…</option>
            {(students ?? []).map((s: any) => (
              <option key={s.profile_id} value={s.profile_id}>
                {s.profiles?.full_name} — {s.admission_no}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
            Description <span className="text-red-500">*</span>
          </span>
          <input
            name="description"
            required
            placeholder="Term 1 tuition fees"
            className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
              Amount (₹) <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              name="amount"
              required
              min={1}
              step={1}
              className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
              Due date
            </span>
            <input
              type="date"
              name="due_date"
              className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
            />
          </label>
        </div>

        <button className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark">
          Create fee
        </button>
      </form>
    </div>
  );
}
