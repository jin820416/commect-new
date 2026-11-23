// Web inquiries and briefing sign-ups are delivered by email only; nothing is stored.
// Shared by the Vercel function (api/inquiry.mjs), the local preview server and the tests.

export const KINDS = ['거래 문의', '브리핑 수신', '기타', 'Trade inquiry', 'Briefing subscription', 'Other'];
const BRIEFING = new Set(['브리핑 수신', 'Briefing subscription']);
const LIMITS = { company: 120, name: 120, email: 254, phone: 40, message: 5000 };
export const MIN_FILL_MS = 3000;          // faster than this is treated as a bot
const EMAIL = /^[^\s@<>()",;:\\[\]]+@[^\s@<>()",;:\\[\]]+\.[^\s@<>()",;:\\[\]]+$/;
const PHONE = /^[0-9+()\-.\s]{4,40}$/;

// Single-line fields never keep line breaks (no header injection).
const oneLine = value => String(value ?? '').replace(/[\r\n\t\u2028\u2029]+/g, ' ').trim();

export function validate(body) {
  const data = {
    lang: body?.lang === 'en' ? 'en' : 'ko',
    kind: oneLine(body?.kind),
    company: oneLine(body?.company),
    name: oneLine(body?.name),
    email: oneLine(body?.email),
    phone: oneLine(body?.phone),
    message: String(body?.message ?? '').replace(/\r\n?/g, '\n').trim(),
  };
  const errors = [];
  if (!KINDS.includes(data.kind)) errors.push('kind');
  for (const key of ['company', 'name', 'email', 'phone']) if (!data[key]) errors.push(key);
  for (const [key, max] of Object.entries(LIMITS)) if (data[key].length > max) errors.push(key);
  if (data.email && !EMAIL.test(data.email)) errors.push('email');
  if (data.phone && !PHONE.test(data.phone)) errors.push('phone');
  if (body?.consent !== true) errors.push('consent');
  data.briefing = BRIEFING.has(data.kind);
  if (data.briefing && body?.consent_mail !== true) errors.push('consent_mail');
  return { data, errors: [...new Set(errors)] };
}

export function looksAutomated(body) {
  if (String(body?.website ?? '').trim()) return true;          // hidden field filled in
  const elapsed = Number(body?.elapsed);
  return !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS;
}

function seoulTime(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

export function composeMail(data, { from, to, now = new Date() }) {
  const subject = data.briefing ? `[브리핑 신청] ${data.company}` : `[웹 문의] ${data.kind} · ${data.company}`;
  const lines = [
    `유형: ${data.kind}`,
    `회사명: ${data.company}`,
    `담당자명: ${data.name}`,
    `이메일: ${data.email}`,
    `전화번호: ${data.phone}`,
    `페이지: ${data.lang === 'en' ? '영문' : '국문'}`,
    `접수: ${seoulTime(now)} (한국 시간)`,
    '',
    '개인정보 수집·이용 동의: 예',
  ];
  if (data.briefing) lines.push('브리핑 메일 수신 동의: 예');
  if (!data.briefing || data.message) lines.push('', '문의 내용:', data.message || '-');
  lines.push('', '— commect.ai 문의 양식에서 보낸 메일입니다. 답장하면 문의하신 분께 갑니다.');
  return {
    from: { name: 'COMMECT 웹사이트', address: from },
    to,
    replyTo: { name: data.name, address: data.email },
    subject: subject.slice(0, 200),
    text: lines.join('\n'),
  };
}

// Best effort only: counts live per function instance. Only accepted (valid) submissions count,
// and a refused attempt is not recorded, so a visitor is free again once the window passes.
const recent = new Map();
export function throttled(ip, nowMs, max = 5, windowMs = 10 * 60 * 1000) {
  if (!ip) return false;
  const hits = (recent.get(ip) || []).filter(t => nowMs - t < windowMs);
  if (hits.length >= max) { recent.set(ip, hits); return true; }
  hits.push(nowMs);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return false;
}

export async function handleInquiry(body, { send, from, to, ip = '', now = new Date() }) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { status: 400, body: { ok: false, error: 'invalid' } };
  if (looksAutomated(body)) return { status: 200, body: { ok: true } };   // drop quietly
  const { data, errors } = validate(body);
  if (errors.length) return { status: 400, body: { ok: false, error: 'invalid', fields: errors } };
  if (throttled(ip, now.getTime())) return { status: 429, body: { ok: false, error: 'busy' } };
  if (!from || !to) return { status: 500, body: { ok: false, error: 'config' } };
  try {
    await send(composeMail(data, { from, to, now }));
  } catch {
    return { status: 502, body: { ok: false, error: 'send' } };
  }
  return { status: 200, body: { ok: true } };
}
