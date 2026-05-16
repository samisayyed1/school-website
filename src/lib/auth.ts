import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/middleware";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  role: AppRole;
  phone: string | null;
  avatar_url: string | null;
  workspace_email: string | null;
};

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,phone,avatar_url,workspace_email")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(allowed: AppRole[]): Promise<Profile> {
  const profile = await requireProfile();
  if (!allowed.includes(profile.role)) {
    const home = roleHome(profile.role);
    redirect(home);
  }
  return profile;
}

export function roleHome(role: AppRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "principal":
    case "coordinator":
      return "/principal";
    case "teacher":
      return "/teacher";
    case "student":
      return "/student";
    case "parent":
      return "/parent";
  }
}

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrator",
  principal: "Principal",
  coordinator: "Coordinator",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};
