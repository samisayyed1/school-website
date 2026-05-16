"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateState = { error?: string; ok?: boolean };

export async function updateNotificationChannels(
  id: string,
  _prev: UpdateState,
  formData: FormData
): Promise<UpdateState> {
  const supabase = createClient();

  // RLS + the enforce_admin_profile_scope trigger gate this; we still verify
  // role here for a clear early-exit error message.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "principal"].includes(profile.role)) {
    return { error: "Only admin or principal can edit users." };
  }

  const notification_email =
    String(formData.get("notification_email") ?? "").trim() || null;
  const notification_phone =
    String(formData.get("notification_phone") ?? "").trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ notification_email, notification_phone })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { ok: true };
}
