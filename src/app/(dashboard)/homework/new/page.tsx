import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { HomeworkForm } from "./HomeworkForm";

export default async function NewHomeworkPage() {
  const profile = await requireRole(["teacher", "coordinator", "principal", "admin"]);
  const supabase = createClient();

  // For teachers, scope classes to their assignments. Senior staff get all.
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

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  return (
    <div className="p-6">
      <Link href="/homework" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Homework
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Post homework</h1>
      <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
        Share a task with your class. Attach a PDF, image, or doc if you have one.
      </p>
      <HomeworkForm classes={classes} subjects={subjects ?? []} />
    </div>
  );
}
