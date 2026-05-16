"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/supabase/middleware";

export type CreateUserState = { error?: string; ok?: boolean };

export async function createUserAction(
  _prev: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  // Step 1: confirm the caller is admin or principal.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!callerProfile || !["admin", "principal"].includes(callerProfile.role)) {
    return { error: "Only admin or principal can create users." };
  }

  // Step 2: validate input.
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "") as AppRole;
  const notification_email =
    String(formData.get("notification_email") ?? "").trim() || email;
  const notification_phone =
    String(formData.get("notification_phone") ?? "").trim() || phone;

  if (!email || !password || !full_name || !role) {
    return { error: "Email, password, full name, and role are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  const validRoles: AppRole[] = [
    "admin",
    "principal",
    "coordinator",
    "teacher",
    "student",
    "parent",
  ];
  if (!validRoles.includes(role)) {
    return { error: "Invalid role." };
  }

  // Step 3: create the auth user via service_role admin API.
  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return {
      error:
        "Admin API unavailable: SUPABASE_SERVICE_ROLE_KEY is not configured.",
    };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip verification — admin-issued accounts are trusted
    user_metadata: {
      full_name,
      role,
      phone,
      notification_email,
      notification_phone,
    },
  });

  if (createErr || !created.user) {
    return {
      error: createErr?.message ?? "Could not create user.",
    };
  }

  // Step 4: belt-and-suspenders — make sure the profile row reflects exactly
  // what was submitted (the trigger inserts defaults; we overwrite from here).
  await admin
    .from("profiles")
    .update({
      full_name,
      role,
      phone,
      notification_email,
      notification_phone,
    })
    .eq("id", created.user.id);

  // Step 5: also seed the role-specific detail row so the user is usable
  // immediately (rosters, attendance, fees, etc.).
  if (role === "student") {
    const admissionNo = `VIP-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    await admin.from("students").insert({
      profile_id: created.user.id,
      admission_no: admissionNo,
    });
  } else if (role === "teacher") {
    const empId = `T-${Math.floor(Math.random() * 9000 + 1000)}`;
    await admin.from("teachers").insert({
      profile_id: created.user.id,
      employee_id: empId,
    });
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
