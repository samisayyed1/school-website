import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function createExam(formData: FormData) {
  "use server";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const class_id = String(formData.get("class_id") ?? "");
  const exam_date = String(formData.get("exam_date") ?? "") || null;
  const max_marks = Number(formData.get("max_marks") ?? 100);
  if (!title || !class_id) return;

  const { data: exam, error } = await supabase
    .from("exams")
    .insert({ title, class_id, exam_date, max_marks, created_by: user.id })
    .select("id")
    .single();
  if (error || !exam) return;

  revalidatePath("/exams");
  redirect(`/exams/${exam.id}`);
}

export default async function NewExamPage() {
  const profile = await requireRole(["teacher", "coordinator", "principal"]);
  const supabase = createClient();

  // Teacher: only classes they're assigned to.
  // Senior staff: all classes.
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

  return (
    <div className="p-6">
      <Link href="/exams" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Exams
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Schedule exam</h1>

      <form action={createExam} className="mt-6 space-y-5 max-w-2xl">
        <Field name="title" label="Title" required placeholder="Unit Test 1" />
        <Field name="class_id" label="Class" required type="select">
          <option value="">Choose class…</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="exam_date" label="Exam date" type="date" />
          <Field name="max_marks" label="Max marks" type="number" defaultValue="100" />
        </div>
        <button className="rounded-full bg-vip-emerald text-white text-sm font-semibold px-6 py-3 shadow-soft hover:bg-vip-emeraldDark">
          Create & enter marks →
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-vip-muted dark:text-zinc-500">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {type === "select" ? (
        <select
          name={name}
          required={required}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
        />
      )}
    </label>
  );
}
