/**
 * Email via Resend. No-op (returns { sent: false }) unless RESEND_API_KEY is set.
 * Replace with SendGrid/SES by swapping this module — call signature stays the same.
 */

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: EmailInput): Promise<{ sent: boolean; error?: string; id?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "no-reply@vipschoolnizamabad.com";

  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send", { to: input.to, subject: input.subject });
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { sent: false, error: `Resend ${res.status}: ${body}` };
    }
    const data = (await res.json()) as { id?: string };
    return { sent: true, id: data.id };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
