"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markFeePaid(feeId: string, paymentRef: string | null = null) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!prof || !["admin", "principal"].includes(prof.role)) return;

  await supabase
    .from("fees")
    .update({ paid: true, paid_at: new Date().toISOString(), payment_ref: paymentRef })
    .eq("id", feeId);
  revalidatePath("/list/fees");
}
