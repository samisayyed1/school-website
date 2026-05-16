"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

export async function saveMarks(examId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const subject_id = String(formData.get("subject_id") ?? "");
  if (!subject_id) return;

  const publish = formData.get("publish") === "on";

  const rows: any[] = [];
  formData.forEach((value, key) => {
    if (key.startsWith("marks_") && typeof value === "string" && value !== "") {
      const student_id = key.slice("marks_".length);
      const marks_obtained = Number(value);
      if (!Number.isFinite(marks_obtained)) return;
      rows.push({
        exam_id: examId,
        student_id,
        subject_id,
        marks_obtained,
        graded_by: user.id,
        published: publish,
      });
    }
  });

  if (!rows.length) return;

  // Upsert on unique(exam_id, student_id, subject_id)
  await supabase.from("results").upsert(rows, {
    onConflict: "exam_id,student_id,subject_id",
  });

  // Fan out notifications only on publish, best-effort.
  if (publish) {
    const studentIds = rows.map((r) => r.student_id);
    const { data: students } = await supabase
      .from("profiles")
      .select("id, full_name, notification_email, notification_phone")
      .in("id", studentIds);

    const { data: examInfo } = await supabase
      .from("exams")
      .select("title")
      .eq("id", examId)
      .single();

    const title = examInfo?.title ?? "Exam";
    for (const s of students ?? []) {
      notify(
        { email: s.notification_email, phone: s.notification_phone },
        {
          subject: `Your ${title} result is published`,
          html: `<p>Dear ${s.full_name},</p><p>Your result for <strong>${title}</strong> is now published. Sign in to your portal to view it.</p><p>— The VIP School of Excellence</p>`,
          text: `Your ${title} result is published. Sign in to view.`,
          whatsapp: `VIP School: Your ${title} result is published. Open the portal to view.`,
        }
      ).catch(() => {});
    }
  }

  revalidatePath(`/exams/${examId}`);
  revalidatePath("/list/results");
  revalidatePath("/student");
  revalidatePath("/parent");
}
