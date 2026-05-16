"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function ensureAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "principal", "coordinator"].includes(profile.role)) return null;
  return supabase;
}

export async function enrollStudent(classId: string, formData: FormData) {
  const supabase = await ensureAdmin();
  if (!supabase) return;
  const studentId = String(formData.get("student_id") ?? "");
  if (!studentId) return;
  await supabase.from("students").update({ class_id: classId }).eq("profile_id", studentId);
  revalidatePath(`/admin/classes/${classId}`);
}

export async function unenrollStudent(classId: string, formData: FormData) {
  const supabase = await ensureAdmin();
  if (!supabase) return;
  const studentId = String(formData.get("student_id") ?? "");
  if (!studentId) return;
  await supabase.from("students").update({ class_id: null }).eq("profile_id", studentId);
  revalidatePath(`/admin/classes/${classId}`);
}

export async function setClassTeacher(classId: string, formData: FormData) {
  const supabase = await ensureAdmin();
  if (!supabase) return;
  const teacherId = String(formData.get("teacher_id") ?? "") || null;
  await supabase.from("classes").update({ class_teacher_id: teacherId }).eq("id", classId);
  revalidatePath(`/admin/classes/${classId}`);
  revalidatePath("/admin/classes");
}

export async function addTeacherAssignment(classId: string, formData: FormData) {
  const supabase = await ensureAdmin();
  if (!supabase) return;
  const teacher_id = String(formData.get("teacher_id") ?? "");
  const subject_id = String(formData.get("subject_id") ?? "");
  if (!teacher_id || !subject_id) return;
  await supabase.from("class_assignments").insert({ teacher_id, class_id: classId, subject_id });
  revalidatePath(`/admin/classes/${classId}`);
}

export async function removeTeacherAssignment(classId: string, formData: FormData) {
  const supabase = await ensureAdmin();
  if (!supabase) return;
  const id = String(formData.get("assignment_id") ?? "");
  if (!id) return;
  await supabase.from("class_assignments").delete().eq("id", id);
  revalidatePath(`/admin/classes/${classId}`);
}

export async function linkParent(classId: string, formData: FormData) {
  const supabase = await ensureAdmin();
  if (!supabase) return;
  const student_id = String(formData.get("student_id") ?? "");
  const parent_id = String(formData.get("parent_id") ?? "") || null;
  if (!student_id) return;
  await supabase.from("students").update({ parent_id }).eq("profile_id", student_id);
  revalidatePath(`/admin/classes/${classId}`);
}
