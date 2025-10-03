import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter from environment variables.
 * Required env vars (configure in Render / future VPS):
 *  - MAIL_HOST
 *  - MAIL_PORT (number)
 *  - MAIL_USER
 *  - MAIL_PASS
 *  - MAIL_FROM (display sender)
 */
class MailEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailEnvError';
  }
}

export function createTransport() {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;
  // If config is present, create real transport
  if (MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS) {
    return nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: Number(MAIL_PORT) === 465, // true for 465, false for others
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });
  }

  // Fallback for local/dev so the form doesn't 500 while you haven't set SMTP yet
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[mail] SMTP env vars missing – using jsonTransport (no real email sent).');
    return nodemailer.createTransport({ jsonTransport: true });
  }

  throw new MailEnvError('Mail transport env vars missing');
}

export interface SendMailOptions { to: string; subject: string; html: string; replyTo?: string; from?: string }

export async function sendMail(opts: SendMailOptions) {
  const transporter = createTransport();
  // Prefer explicitly provided from (user supplied), else configured MAIL_FROM, else fallback.
  // NOTE: Some SMTP providers will reject arbitrary From domains; if failures occur consider using MAIL_FROM and setting replyTo to user address instead.
  const from = sanitizeHeader(opts.from) || process.env.MAIL_FROM || 'SoloYolo <no-reply@soloyolo.in>';
  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  });
  // If using jsonTransport, log a preview so you can inspect
  const tOpts = (transporter as unknown as { options?: { jsonTransport?: boolean } }).options;
  if (tOpts?.jsonTransport) {
    console.log('[mail][dev] Message (not sent) id=%s envelope=%o', info.messageId, info.envelope);
  }
  return info;
}

function sanitizeHeader(v?: string) {
  if (!v) return '';
  // Remove CR/LF to prevent header injection
  return v.replace(/[\r\n]+/g, ' ').trim();
}
