/**
 * WhatsApp messaging via Meta Cloud API (default) — or swap WHATSAPP_PROVIDER=wati
 * for a Wati implementation. No-op unless WHATSAPP_API_TOKEN is set.
 */

type WhatsAppInput = {
  to: string; // E.164, e.g. "+919912388801"
  body: string;
};

export async function sendWhatsApp(input: WhatsAppInput): Promise<{ sent: boolean; error?: string }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const provider = (process.env.WHATSAPP_PROVIDER ?? "meta").toLowerCase();

  if (!token || !phoneId) {
    console.warn("[whatsapp] credentials not set — skipping send", { to: input.to });
    return { sent: false, error: "WhatsApp credentials not configured" };
  }

  if (provider === "meta") {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: input.to.replace(/\s|\+/g, ""),
            type: "text",
            text: { body: input.body },
          }),
        }
      );
      if (!res.ok) {
        const body = await res.text();
        return { sent: false, error: `Meta WA ${res.status}: ${body}` };
      }
      return { sent: true };
    } catch (err) {
      return { sent: false, error: err instanceof Error ? err.message : "unknown" };
    }
  }

  return { sent: false, error: `Unknown WHATSAPP_PROVIDER: ${provider}` };
}
