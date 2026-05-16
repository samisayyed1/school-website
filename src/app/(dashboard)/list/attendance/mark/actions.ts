"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveAttendance(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const date = String(formData.get("date") ?? "").trim();
  if (!date) return;

  // Each student input is named status_<studentId> = "present" | "absent" | "late"
  const updates: { student_id: string; date: string; status: string; marked_by: string }[] = [];
  formData.forEach((value, key) => {
    if (key.startsWith("status_") && typeof value === "string") {
      const student_id = key.slice("status_".length);
      if (["present", "absent", "late"].includes(value)) {
        updates.push({ student_id, date, status: value, marked_by: user.id });
      }
    }
  });
  if (!updates.length) return;

  // Upsert on (student_id, date) — replaces existing record for same day.
  await supabase
    .from("attendance")
    .upsert(updates, { onConflict: "student_id,date" });

  revalidatePath("/list/attendance");
  revalidatePath("/student");
  revalidatePath("/parent");
  redirect(`/list/attendance?date=${date}`);
}
