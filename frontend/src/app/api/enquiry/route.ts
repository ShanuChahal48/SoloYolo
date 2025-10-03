import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  const { tripTitle, tripSlug, name, email, phone, message, callback } = body || {};
    if (!tripTitle || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminTo = process.env.ENQUIRY_TO || process.env.MAIL_TO || 'admin@soloyolo.in';

    try {
      const displayFrom = name ? `${escapeHeaderDisplay(name)} <${escapeHeaderEmail(email)}>` : escapeHeaderEmail(email);
      await sendMail({
        to: adminTo,
        subject: `[Enquiry] ${tripTitle}`,
        replyTo: email,
        from: displayFrom,
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.6;">
          <h2 style="color:#0f172a;margin:0 0 8px;">New Trip Enquiry</h2>
          <p><strong>Trip:</strong> ${escapeHtml(tripTitle)} (${escapeHtml(tripSlug || '')})</p>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
          <p><strong>Callback Requested:</strong> ${callback ? 'Yes' : 'No'}</p>
          ${message ? `<p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g,'<br/>')}</p>` : ''}
          <hr style="margin:24px 0;"/>
          <p style="font-size:12px;color:#64748b;">Generated from the Enquire button on soloyolo.in</p>
        </body></html>`
      });
    } catch (mailErr: unknown) {
      const message = mailErr instanceof Error ? mailErr.message : '';
      const isMissing = /Mail transport env vars missing/i.test(message);
      if (isMissing && process.env.NODE_ENV !== 'production') {
        console.warn('[enquiry] Mail vars missing; returning dev fallback success.');
        return NextResponse.json({ ok: true, devFallback: true });
      }
      throw mailErr instanceof Error ? mailErr : new Error('Unknown mail error');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Enquiry error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

function escapeHeaderEmail(str: string) {
  return str.replace(/[\r\n<>"']/g, '').trim();
}
function escapeHeaderDisplay(str: string) {
  return str.replace(/[\r\n<>"']/g, ' ').trim();
}
