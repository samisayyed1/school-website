"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; ok?: boolean };

export async function updateOwnProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  const avatar_url = String(formData.get("avatar_url") ?? "").trim() || null;
  const notification_email =
    String(formData.get("notification_email") ?? "").trim() || null;
  const notification_phone =
    String(formData.get("notification_phone") ?? "").trim() || null;

  if (!full_name) return { error: "Full name is required." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, avatar_url, notification_email, notification_phone })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/settings");
  return { ok: true };
}
