import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";

/**
 * Admin-only WhatsApp test endpoint.
 *
 * POST /api/whatsapp/test
 * body: { to: "+919999999999", body: "Hello from VIP School" }
 *
 * Returns { sent, error? }. Used to verify Meta Cloud API credentials
 * after pasting WHATSAPP_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID into .env.local.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "principal"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: { to?: string; body?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!payload.to || !payload.body) {
    return NextResponse.json(
      { error: "Both 'to' (E.164 phone) and 'body' (message) are required" },
      { status: 400 }
    );
  }

  const result = await sendWhatsApp({ to: payload.to, body: payload.body });
  return NextResponse.json(result, { status: result.sent ? 200 : 502 });
}
