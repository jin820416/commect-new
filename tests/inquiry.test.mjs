import test from 'node:test';
import assert from 'node:assert/strict';
import { validate, composeMail, handleInquiry, MIN_FILL_MS } from '../lib/inquiry.mjs';
import { createSiteServer } from '../scripts/serve.mjs';

const good = (extra = {}) => ({
  kind: '거래 문의', company: 'Test Company', name: 'Test Contact', email: 'qa@example.invalid',
  phone: '010-0000-0000', message: '품목과 물량 문의\n둘째 줄', consent: true, lang: 'ko', website: '', elapsed: 8000, ...extra,
});
const deps = (sent, extra = {}) => ({ send: async mail => { sent.push(mail); }, from: 'site@example.invalid', to: 'inbox@example.invalid', ip: '', now: new Date('2026-11-23T01:15:00Z'), ...extra });

test('a valid inquiry becomes one plain-text email with reply-to set to the sender', async () => {
  const sent = [];
  const result = await handleInquiry(good(), deps(sent));
  assert.equal(result.status, 200);
  assert.equal(sent.length, 1);
  const mail = sent[0];
  assert.equal(mail.subject, '[웹 문의] 거래 문의 · Test Company');
  assert.deepEqual(mail.replyTo, { name: 'Test Contact', address: 'qa@example.invalid' });
  assert.equal(mail.to, 'inbox@example.invalid');
  assert.equal(mail.from.address, 'site@example.invalid');
  assert.match(mail.text, /접수: 2026-11-23 10:15 \(한국 시간\)/);
  assert.match(mail.text, /문의 내용:\n품목과 물량 문의\n둘째 줄/);
  assert.equal(mail.html, undefined);
});

test('a briefing sign-up needs the mail consent and gets its own subject', async () => {
  const sent = [];
  const without = await handleInquiry(good({ kind: '브리핑 수신', message: '' }), deps(sent));
  assert.equal(without.status, 400);
  assert.deepEqual(without.body.fields, ['consent_mail']);
  const withConsent = await handleInquiry(good({ kind: 'Briefing subscription', message: '', consent_mail: true, lang: 'en' }), deps(sent));
  assert.equal(withConsent.status, 200);
  assert.equal(sent[0].subject, '[브리핑 신청] Test Company');
  assert.match(sent[0].text, /브리핑 메일 수신 동의: 예/);
  assert.match(sent[0].text, /전화번호: 010-0000-0000/);
  assert.match(sent[0].text, /페이지: 영문/);
  assert.doesNotMatch(sent[0].text, /문의 내용/);
});

test('required fields, lengths, email, phone, type and consent are checked on the server', () => {
  const cases = [
    [{ company: '' }, 'company'], [{ name: ' ' }, 'name'], [{ email: 'not-an-email' }, 'email'],
    [{ email: 'a@b.c\r\nBcc: x@y.z' }, 'email'], [{ phone: 'call me' }, 'phone'], [{ phone: ' ' }, 'phone'], [{ kind: 'Spam' }, 'kind'],
    [{ consent: 'yes' }, 'consent'], [{ message: 'x'.repeat(5001) }, 'message'], [{ company: 'x'.repeat(121) }, 'company'],
  ];
  for (const [change, field] of cases) assert.ok(validate(good(change)).errors.includes(field), field);
  assert.deepEqual(validate(good()).errors, []);
});

test('line breaks never reach single-line fields used in mail headers', async () => {
  const sent = [];
  await handleInquiry(good({ company: 'Evil\r\nBcc: victim@example.invalid', name: 'A\nB' }), deps(sent));
  assert.equal(sent[0].subject, '[웹 문의] 거래 문의 · Evil Bcc: victim@example.invalid');
  assert.doesNotMatch(sent[0].subject + sent[0].replyTo.name, /[\r\n]/);
});

test('bots are dropped quietly: hidden field filled or submitted too fast', async () => {
  for (const extra of [{ website: 'http://spam.example' }, { elapsed: MIN_FILL_MS - 1 }, { elapsed: undefined }]) {
    const sent = [];
    const result = await handleInquiry(good(extra), deps(sent));
    assert.equal(result.status, 200);
    assert.equal(sent.length, 0);
  }
});

test('a failed send is reported so the visitor can retry; missing settings are an error', async () => {
  const failing = await handleInquiry(good(), deps([], { send: async () => { throw new Error('SMTP down'); } }));
  assert.equal(failing.status, 502);
  const unset = await handleInquiry(good(), deps([], { from: '' }));
  assert.equal(unset.status, 500);
  assert.equal((await handleInquiry('nonsense', deps([]))).status, 400);
});

test('repeated submissions from one address are slowed down', async () => {
  const sent = [];
  const statuses = [];
  for (let i = 0; i < 7; i++) statuses.push((await handleInquiry(good(), deps(sent, { ip: '203.0.113.9' }))).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429, 429]);
});

test('only accepted submissions count toward the limit, and a refused one does not extend it', async () => {
  const sent = [];
  const t0 = new Date('2026-11-23T04:00:00Z');
  const at = minutes => new Date(t0.getTime() + minutes * 60 * 1000);
  const ip = '203.0.113.10';
  for (let i = 0; i < 3; i++) assert.equal((await handleInquiry(good({ email: 'bad' }), deps(sent, { ip, now: t0 }))).status, 400);
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push((await handleInquiry(good(), deps(sent, { ip, now: at(i) }))).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
  assert.equal((await handleInquiry(good(), deps(sent, { ip, now: at(9) }))).status, 429);
  assert.equal((await handleInquiry(good(), deps(sent, { ip, now: at(10.1) }))).status, 200);
  assert.equal(sent.length, 6);
});

test('the local preview answers /api/inquiry without emailing anyone', async t => {
  const sent = [];
  const server = createSiteServer({ sendInquiry: async mail => { sent.push(mail); } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const ok = await fetch(base + '/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(good()) });
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { ok: true });
  assert.equal(sent.length, 1);
  const bad = await fetch(base + '/api/inquiry', { method: 'POST', body: '{not json' });
  assert.equal(bad.status, 400);
  assert.equal((await fetch(base + '/api/inquiry')).status, 404);
});
