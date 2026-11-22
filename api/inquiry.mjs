// POST /api/inquiry — emails a web inquiry or briefing sign-up to COMMECT (Zoho SMTP).
// Environment (Vercel project settings): SMTP_USER, SMTP_PASS (secret), INQUIRY_TO;
// optional SMTP_HOST (default smtp.zoho.com) and SMTP_PORT (default 465).
import nodemailer from 'nodemailer';
import { handleInquiry } from '../lib/inquiry.mjs';

let transport;
function mailer() {
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transport;
}

export async function POST(request) {
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 20000) throw new Error('too large');
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: 'invalid' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const result = await handleInquiry(body, {
    send: mail => mailer().sendMail(mail),
    from: process.env.SMTP_USER,
    to: process.env.INQUIRY_TO || process.env.SMTP_USER,
    ip,
  });
  console.log(JSON.stringify({ inquiry: result.status }));   // no personal data in logs
  return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
}
