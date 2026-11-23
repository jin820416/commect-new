import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createSiteServer } from '../scripts/serve.mjs';
import { content } from '../content/site.mjs';

const root = path.resolve('dist');
const pageNames = ['index', 'sourcing', 'market', 'about', 'contact', 'policy', 'privacy', '404'];
const files = ['ko', 'en'].flatMap(lang => pageNames.map(page => ({ lang, page, file: `${lang === 'en' ? 'en/' : ''}${page}.html` })));
function hrefFile(href) {
  const url = new URL(href, 'https://www.commect.ai');
  const p = url.pathname;
  return p === '/' ? 'index.html' : p === '/en' || p === '/en/' ? 'en/index.html' : p.replace(/^\//, '') + (path.extname(p) ? '' : '.html');
}

test('all bilingual pages, internal targets and assets are present in the public bundle', async () => {
  for (const { lang, page, file } of files) {
    const html = await readFile(path.join(root, file), 'utf8');
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: single page heading`);
    assert.match(html, /<main id="main">/);
    assert.doesNotMatch(html, /<br class="desktop-break">\S/, `${file}: mobile line-break separator`);
    assert.doesNotMatch(html, /보세물류|파렛타이징|수탁 프로세스|파트너쉽|네트워크로 부터|전세계|mailto:jin\.kim|href="#"/);
    assert.match(html, /href="mailto:sales@commect\.ai"/);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = match[1];
      if (/^(?:https?:|mailto:|tel:|#)/.test(href)) continue;
      await access(path.join(root, hrefFile(href)));
      const hash = new URL(href, 'https://www.commect.ai').hash;
      if (hash) {
        const target = await readFile(path.join(root, hrefFile(href)), 'utf8');
        assert.ok(target.includes(`id="${hash.slice(1)}"`), `${file}: missing ${href}`);
      }
    }
    if (['policy', 'privacy'].includes(page)) {
      assert.match(html, /noindex,follow/);
      assert.doesNotMatch(html, /검토용 초안|Draft for review|확인 필요|Confirmation required|proposed standard|draft-notice/);
    }
  }
  const css = await readFile(path.join(root, 'assets/site.css'), 'utf8');
  for (const match of css.matchAll(/url\('([^']+)'\)/g)) await access(path.join(root, match[1]));
});

test('clean URLs, legacy query links and retired routes return the expected result', async t => {
  const server = createSiteServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const url of ['/', '/sourcing', '/market', '/about', '/contact', '/policy', '/privacy', '/en', '/en/sourcing', '/en/market', '/en/about', '/en/contact', '/en/policy', '/en/privacy']) {
    const response = await fetch(base + url);
    assert.equal(response.status, 200, url);
    assert.match(response.headers.get('content-type'), /text\/html/);
  }
  for (const [from, to] of [['/index.html', '/'], ['/en/index.html', '/en'], ['/en/', '/en'], ['/policy.html?mode=policy', '/policy?mode=policy'], ['/privacy.html?mode=privacy', '/privacy?mode=privacy'], ['/service', '/sourcing'], ['/process', '/sourcing'], ['/service.html', '/sourcing'], ['/en/service', '/en/sourcing'], ['/en/process', '/en/sourcing']]) {
    const response = await fetch(base + from, { redirect: 'manual' });
    assert.equal(response.status, 308, from);
    assert.equal(response.headers.get('location'), to);
  }
  const icon = await fetch(base + '/images/favicon.svg');
  assert.equal(icon.status, 200);
  assert.equal(icon.headers.get('content-type'), 'image/svg+xml');
  assert.match(await icon.text(), /<svg\b/);
  for (const url of ['/consignment', '/consignment.html', '/privacy-original.html', '/index-original.html', '/docs/commect-refinement-plan.md', '/content/site.mjs', '/unknown']) {
    const response = await fetch(base + url);
    assert.equal(response.status, 404, url);
    assert.match(await response.text(), /페이지를 찾을 수 없습니다/);
  }
  const en404 = await fetch(base + '/en/unknown');
  assert.equal(en404.status, 404);
  assert.match(await en404.text(), /Page not found/);
});

// Exercise the actual shared form script without sending anything anywhere.
async function formHarness(lang, fetchResult = 'success') {
  const script = await readFile(path.join(root, 'assets/site.js'), 'utf8');
  const listeners = {};
  const calls = [];
  const classes = { toggle() {}, remove() {} };
  const status = { textContent: '', classList: classes, focus() {} };
  const buttonLabel = { textContent: content[lang].contact.submit };
  const button = { disabled: false, querySelector: () => buttonLabel };
  const fields = Object.fromEntries(['name', 'company', 'phone', 'email', 'message', 'website', 'consent'].map(k => [k, { value: ({ name: ' Test Contact ', company: ' Test Company ', email: 'qa@example.invalid', message: 'A test enquiry', phone: ' 010-0000-0000 ' })[k] || '', checked: k === 'consent', custom: '', setCustomValidity(message) { this.custom = message; }, setAttribute() {}, removeAttribute() {}, get validity() { return { valid: !this.custom && (k !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) }; } }]));
  let resets = 0;
  const form = {
    elements: { namedItem: key => fields[key] },
    querySelector: selector => selector === '[role=status]' ? status : button,
    querySelectorAll: () => [],
    addEventListener: (event, fn) => { listeners[event] = fn; },
    setAttribute() {}, removeAttribute() {},
    checkValidity: () => ['name', 'company', 'email', 'phone'].every(k => fields[k].validity.valid) && fields.consent.checked,
    reportValidity() {},
    reset() { resets++; Object.values(fields).forEach(f => { f.value = ''; f.checked = false; }); },
  };
  const context = {
    document: {
      querySelector: selector => selector === '[data-inquiry-form]' ? form : null,
      querySelectorAll: () => [],
      getElementById: () => ({ textContent: JSON.stringify(content[lang].contact) }),
      addEventListener() {},
    },
    window: { scrollY: 0, addEventListener() {} }, location: { hash: '' }, navigator: { onLine: true },
    matchMedia: () => ({ addEventListener() {} }),
    URL, AbortController, setTimeout, clearTimeout,
    FormData: class { get(key) { return fields[key]?.value; } },
    fetch: async (url, options) => {
      calls.push({ url: String(url), options });
      if (fetchResult === 'network') throw new Error('Disconnected');
      if (typeof fetchResult === 'function') return fetchResult();
      return { ok: fetchResult === 'success', status: fetchResult === 'success' ? 201 : 500 };
    },
  };
  vm.runInNewContext(script, context);
  return { fields, calls, button, buttonLabel, status, context, get resets() { return resets; }, submit: () => listeners.submit({ preventDefault() {} }) };
}

for (const lang of ['ko', 'en']) {
  test(`${lang}: accepted inquiry is posted to /api/inquiry, then resets and restores button`, async () => {
    const h = await formHarness(lang);
    await h.submit();
    assert.equal(h.calls.length, 1);
    const request = h.calls[0];
    assert.equal(request.url, '/api/inquiry');
    assert.equal(request.options.method, 'POST');
    const sent = JSON.parse(request.options.body);
    assert.deepEqual({ name: sent.name, company: sent.company, phone: sent.phone, email: sent.email, message: sent.message, consent: sent.consent },
      { name: 'Test Contact', company: 'Test Company', phone: '010-0000-0000', email: 'qa@example.invalid', message: 'A test enquiry', consent: true });
    assert.equal(typeof sent.elapsed, 'number');
    assert.doesNotMatch(request.options.body, /apikey|supabase/i);
    assert.equal(h.resets, 1);
    assert.equal(h.status.textContent, content[lang].contact.success);
    assert.equal(h.button.disabled, false);
    assert.equal(h.buttonLabel.textContent, content[lang].contact.submit);
  });
  test(`${lang}: rejected or disconnected inquiry preserves entries and permits retry`, async () => {
    for (const mode of ['failure', 'network']) {
      const h = await formHarness(lang, mode);
      await h.submit();
      assert.equal(h.resets, 0);
      assert.equal(h.fields.email.value, 'qa@example.invalid');
      assert.equal(h.status.textContent, content[lang].contact.failure);
      assert.equal(h.button.disabled, false);
      assert.equal(h.buttonLabel.textContent, content[lang].contact.submit);
    }
  });
  test(`${lang}: a server-side validation refusal shows the check-your-entries message`, async () => {
    const h = await formHarness(lang, () => ({ ok: false, status: 400 }));
    await h.submit();
    assert.equal(h.resets, 0);
    assert.equal(h.status.textContent, content[lang].contact.invalid);
  });
  test(`${lang}: invalid email, blank company or missing consent never transmits`, async () => {
    for (const [key, value] of [['email', 'bad-email'], ['company', '   '], ['consent', false]]) {
      const h = await formHarness(lang);
      if (key === 'consent') h.fields.consent.checked = value; else h.fields[key].value = value;
      await h.submit();
      assert.equal(h.calls.length, 0);
      assert.equal(h.status.textContent, content[lang].contact.invalid);
    }
  });
}

test('the inquiry type and the mail consent travel as their own fields', async () => {
  const h = await formHarness('ko');
  h.fields.kind = { value: '브리핑 수신' };
  h.fields.consent_mail = { checked: true };
  await h.submit();
  const sent = JSON.parse(h.calls[0].options.body);
  assert.equal(sent.kind, '브리핑 수신');
  assert.equal(sent.consent_mail, true);
  assert.equal(sent.message, 'A test enquiry');
});

test('a second submit while the first is pending does not create a duplicate request', async () => {
  let finish;
  const h = await formHarness('en', () => new Promise(resolve => { finish = resolve; }));
  const first = h.submit();
  await new Promise(resolve => setImmediate(resolve));
  await h.submit();
  assert.equal(h.calls.filter(c => c.options?.method === 'POST').length, 1);
  finish({ ok: true });
  await first;
  assert.equal(h.resets, 1);
});
