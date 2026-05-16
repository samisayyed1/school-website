"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PostState = { error?: string };

export async function postHomework(_prev: PostState, formData: FormData): Promise<PostState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["teacher", "coordinator", "principal", "admin"].includes(profile.role)) {
    return { error: "Only teachers and senior staff can post homework." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const class_id = String(formData.get("class_id") ?? "") || null;
  const subject_id = String(formData.get("subject_id") ?? "") || null;
  const due_date_raw = String(formData.get("due_date") ?? "").trim();
  const due_date = due_date_raw || null;
  const file = formData.get("file") as File | null;

  if (!title || !class_id || !subject_id) {
    return { error: "Title, class, and subject are required." };
  }

  // Upload attachment if provided. RLS on storage.objects gates this.
  let attachment_url: string | null = null;
  let attachment_name: string | null = null;
  let attachment_size: number | null = null;

  if (file && file.size > 0) {
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      return { error: "Attachment exceeds 25 MB limit." };
    }
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("homework")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) return { error: `Upload failed: ${upErr.message}` };
    const { data: pub } = supabase.storage.from("homework").getPublicUrl(path);
    attachment_url = pub.publicUrl;
    attachment_name = safeName;
    attachment_size = file.size;
  }

  const { error: insErr } = await supabase.from("assignments").insert({
    title,
    description,
    class_id,
    subject_id,
    due_date,
    attachment_url,
    attachment_name,
    attachment_size,
    created_by: user.id,
  });
  if (insErr) return { error: insErr.message };

  revalidatePath("/homework");
  revalidatePath("/student");
  revalidatePath("/teacher");
  redirect("/homework");
}
