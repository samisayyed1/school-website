import { sendEmail } from "./email";
import { sendWhatsApp } from "./whatsapp";

export type NotifyTarget = {
  email?: string | null;
  phone?: string | null;
};

export type NotifyPayload = {
  subject: string;
  html: string;
  text?: string;
  whatsapp?: string; // shorter text for WA; falls back to `text` or `subject`
};

/**
 * Multi-channel dispatcher. Best-effort — no throw on partial failure.
 * Call this whenever a school event should fan out to parents/students:
 *   - new announcement
 *   - results published
 *   - fee reminder
 *   - attendance alert
 */
export async function notify(target: NotifyTarget, payload: NotifyPayload) {
  const results = { email: false, whatsapp: false };

  if (target.email) {
    const r = await sendEmail({
      to: target.email,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    results.email = r.sent;
  }

  if (target.phone) {
    const r = await sendWhatsApp({
      to: target.phone,
      body: payload.whatsapp ?? payload.text ?? payload.subject,
    });
    results.whatsapp = r.sent;
  }

  return results;
}

export { sendEmail, sendWhatsApp };
