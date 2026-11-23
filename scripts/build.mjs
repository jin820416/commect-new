import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { content, company, images, briefings } from '../content/site.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const pages = ['home', 'sourcing', 'market', 'about', 'contact', 'policy', 'privacy', '404'];
const navPages = ['sourcing', 'market', 'about', 'contact'];
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = value => escape(value).replace(/\n/g, '<br class="desktop-break"> ');
const breaks = value => escape(value).replace(/\n/g, '<br>');   // line breaks kept on every screen
const img = file => `/images/${file}`;
const route = (lang, page = 'home') => `${lang === 'en' ? '/en' : ''}${page === 'home' ? (lang === 'en' ? '' : '/') : '/' + page}`;
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const globe = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" stroke="currentColor" stroke-width="1.4"/></svg>';
const button = (href, label, extra = '') => `<a class="button ${extra}" data-reveal href="${href}">${arrow}<span>${escape(label)}</span></a>`;
const textLink = (href, label) => `<a class="text-link" href="${href}">${escape(label)} ${arrow}</a>`;
const photo = (file, alt, extra = '', size = 'width="2000" height="1333"') => `<img${extra ? ` class="${extra}"` : ''} src="${img(file)}" alt="${escape(alt)}" loading="lazy" decoding="async" ${size}>`;
const days = { 월: 'Mon', 화: 'Tue', 수: 'Wed', 목: 'Thu', 금: 'Fri', 토: 'Sat', 일: 'Sun' };
const dayLabel = (lang, day) => lang === 'en' ? days[day] : day;

const alts = {
  ko: { sourcing: '창고에 쌓인 생두 마대', info: '모니터에 표시된 가격 차트', trust: '위에서 내려다본 컨테이너 야적장', expertise: '산지 건조장을 둘러보는 사람들', commercial: '브라질 커피 생두 마대', specialty: '건조대 위에서 말리는 커피', daily: '어두운 화면의 가격 추이 차트', monthly: '모니터에 표시된 가격 차트', aboutExpertise: '산지 건조장을 둘러보는 사람들', aboutSourcing: '생두 클로즈업', aboutMarket: '여러 개의 가격 차트와 시세표가 띄워진 화면', aboutTrust: '위에서 내려다본 항구의 컨테이너', contact: '인천종합비즈니스센터 건물 전경' },
  en: { sourcing: 'Sacks of green coffee in a warehouse', info: 'A price chart on a monitor', trust: 'A container yard seen from above', expertise: 'Visitors at a coffee drying station at origin', commercial: 'A sack of Brazilian green coffee', specialty: 'Coffee drying on raised beds', daily: 'A price chart on a dark screen', monthly: 'A price chart on a monitor', aboutExpertise: 'Visitors at a coffee drying station at origin', aboutSourcing: 'Green coffee beans, close up', aboutMarket: 'Screens showing price charts and quotes', aboutTrust: 'Port containers seen from above', contact: 'Incheon Business Center building' },
};

// Transparent over the hero photo; white once scrolled (site.js adds is-scrolled).
// Pages without a hero photo start solid.
function header(lang, page, solid) {
  const c = content[lang];
  const other = lang === 'ko' ? 'en' : 'ko';
  return `<a class="skip-link" href="#main">${c.skip}</a>
  <header class="site-header${solid ? ' header-solid' : ''}" data-header>
    <div class="container header-inner">
      <a class="brand" href="${route(lang)}" aria-label="COMMECT ${c.homeLabel}">
        <img class="logo-dark" src="/images/brand/commect-wordmark-navy.png" width="1024" height="240" alt="COMMECT — Commodity Connect">
        <img class="logo-light" src="/images/brand/commect-wordmark-white.png" width="1024" height="240" alt="" aria-hidden="true">
      </a>
      <nav class="main-nav" id="main-navigation" aria-label="${lang === 'ko' ? '주 메뉴' : 'Main navigation'}">
        ${navPages.map(p => `<a href="${route(lang, p)}"${p === page ? ' aria-current="page"' : ''}>${escape(c.nav[p])}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <div class="language-switch" aria-label="${lang === 'ko' ? '언어 선택' : 'Language'}">${globe}
          ${['ko', 'en'].map(l => l === lang ? `<span class="language-current" lang="${l}" aria-current="true">${l === 'ko' ? 'KR' : 'EN'}</span>` : `<a class="language-link" href="${route(other, page)}" lang="${l}" hreflang="${l}" aria-label="${l === 'ko' ? '한국어로 보기' : 'View in English'}">${l === 'ko' ? 'KR' : 'EN'}</a>`).join('<span class="language-divider" aria-hidden="true"></span>')}
        </div>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="${c.menuOpen}" data-open-label="${c.menuOpen}" data-close-label="${c.menuClose}"><span></span><span></span></button>
      </div>
    </div>
  </header>`;
}

function footer(lang) {
  const c = content[lang];
  return `<footer class="site-footer"><div class="container footer-inner">
    <a class="footer-brand" href="${route(lang)}" aria-label="COMMECT ${c.homeLabel}"><img src="/images/brand/commect-wordmark-white.png" width="1024" height="240" alt="COMMECT — Commodity Connect" loading="lazy"></a>
    <div class="footer-info">
      <span>${company.legalName}</span><span>${c.footer.representative} ${company.representative}</span><span>${c.footer.registration} ${company.registration}</span>
      <address>${escape(lang === 'ko' ? company.address : company.addressEn)}</address>
      <a href="mailto:${company.email}">${company.email}</a>
    </div>
    <div class="footer-bottom"><p>${escape(c.footer.disclaimer)}</p><p><a href="${route(lang, 'policy')}">${c.titles.policy}</a><span aria-hidden="true"> · </span><a href="${route(lang, 'privacy')}">${c.titles.privacy}</a><span aria-hidden="true"> · </span>${c.footer.copyright}</p></div>
  </div></footer>
  <a class="back-to-top" href="#top" aria-label="${lang === 'ko' ? '맨 위로' : 'Back to top'}" hidden data-top><svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="m5 15 7-7 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`;
}

function pageHero(file, title, text) {
  return `<section class="hero hero-page" aria-labelledby="page-title">
    <img class="hero-image" src="${img(file)}" alt="" fetchpriority="high" decoding="async">
    <div class="hero-shade"></div>
    <div class="container hero-content" data-reveal-group="hero"><h1 id="page-title" data-reveal>${escape(title)}</h1><p class="hero-text" data-reveal>${lines(text)}</p></div>
  </section>`;
}

// Photo runs to the screen edge on its side; size varies the height for rhythm.
// href makes the photo a second (mouse-only) link to the same page as the text link.
function split({ id = '', tinted = false, reversed = false, size = '', href = '', file, alt, label, title, text, extra = '' }) {
  const image = photo(file, alt);
  const media = href ? `<a href="${href}" tabindex="-1" aria-hidden="true">${image}</a>` : image;
  return `<section class="section${tinted ? ' section-tinted' : ''}"${id ? ` id="${id}"` : ''}><div class="split${reversed ? ' is-reversed' : ''}" data-reveal-group>
    <div class="split-media${size ? ` media-${size}` : ''}" data-reveal-image="${reversed ? 'right' : 'left'}">${media}</div>
    <div class="split-copy" data-reveal><p class="label">${escape(label)}</p><h2 class="section-title">${escape(title)}</h2><p class="lead">${lines(text)}</p>${extra}</div>
  </div></section>`;
}

// Photo card: the text panel overlaps the bottom of the photo. kind is an optional small label;
// href/more add a "자세히 보기" link.
function card(file, alt, [title, text, kind], en = false, href = '', more = '') {
  return `<article class="card"><div class="card-media" data-reveal-image="up">${photo(file, alt)}</div><div class="card-body" data-reveal>${kind ? `<p class="label">${escape(kind)}</p>` : ''}<h2${en ? ' lang="en"' : ''}>${escape(title)}</h2><p>${escape(text)}</p>${href ? textLink(href, more) : ''}</div></article>`;
}

function band({ id = '', file, alt, label, title, text }) {
  return `<section class="band"${id ? ` id="${id}"` : ''}>${photo(file, alt, 'band-image')}<div class="band-shade"></div>
    <div class="container band-content" data-reveal-group><p class="label" data-reveal>${escape(label)}</p><h2 class="section-title" data-reveal>${escape(title)}</h2><p class="lead" data-reveal>${lines(text)}</p></div></section>`;
}

function contactBand(lang) {
  const c = content[lang];
  return `<section class="contact-band"><div class="container contact-band-inner" data-reveal-group><div data-reveal><h2>${escape(c.contactBand.title)}</h2><p>${escape(c.contactBand.text)}</p></div>${button(route(lang, 'contact'), c.contactButton, 'button-light')}</div></section>`;
}

function briefingList(lang) {
  return `<div class="briefing-list">${briefings.slice(0, 3).map(b => `<a class="briefing-item" href="${route(lang, 'market')}"><span class="briefing-date">${escape(b.date)}</span><span class="briefing-title" lang="ko">${escape(b.title)}</span></a>`).join('')}</div>`;
}

function textField(t, prefix, key, required) {
  const type = key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text';
  const auto = { name: 'name', company: 'organization', phone: 'tel', email: 'email' }[key];
  return `<div class="form-field"><label for="${prefix}-${key}">${t.labels[key]}${required ? '<span class="required" aria-hidden="true">*</span>' : `<span class="optional">${t.optional}</span>`}</label><input id="${prefix}-${key}" name="${key}" type="${type}" autocomplete="${auto}" maxlength="${key === 'email' ? 254 : 120}"${required ? ' required' : ''} aria-describedby="${prefix}-status"></div>`;
}

function form(lang, kind) {
  const t = content[lang][kind];
  const prefix = kind === 'contact' ? 'inquiry' : 'subscribe';
  const kindField = kind === 'contact'
    ? `<fieldset class="kind-field"><legend>${t.kindLabel}<span class="required" aria-hidden="true">*</span></legend><div class="kind-options">${t.kinds.map((k, i) => `<label class="kind-option"><input type="radio" name="kind" value="${escape(k)}"${i ? '' : ' checked'}><span>${escape(k)}</span></label>`).join('')}</div></fieldset>`
    : `<input type="hidden" name="kind" value="${escape(t.kind)}">`;
  const fields = kind === 'contact'
    ? `${textField(t, prefix, 'company', true)}${textField(t, prefix, 'name', true)}${textField(t, prefix, 'email', true)}${textField(t, prefix, 'phone', true)}<div class="form-field field-full"><label for="${prefix}-message">${t.labels.message}<span class="optional">${t.optional}</span></label><textarea id="${prefix}-message" name="message" rows="6" maxlength="5000"></textarea></div>`
    : ['company', 'name', 'email', 'phone'].map(key => textField(t, prefix, key, true)).join('');
  const consents = kind === 'contact'
    ? `<div class="form-consent"><label><input type="checkbox" name="consent" required><span>${t.consent}</span></label><a href="${route(lang, 'privacy')}#collection">${t.privacyLink}</a></div>`
    : `<div class="form-consent"><label><input type="checkbox" name="consent" required><span>${t.consent}</span></label><a href="${route(lang, 'privacy')}#collection">${t.privacyLink}</a></div><div class="form-consent"><label><input type="checkbox" name="consent_mail" required><span>${t.consentMail}</span></label></div>`;
  return `<form class="inquiry-form form-panel" data-inquiry-form novalidate>
    ${kindField}<div class="form-grid">${fields}</div>
    <div class="form-trap" aria-hidden="true"><label for="${prefix}-website">Website</label><input id="${prefix}-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
    ${consents}
    <p class="form-status" id="${prefix}-status" role="status" aria-live="polite" tabindex="-1"></p>
    <div class="form-submit"><button class="button" type="submit" data-submit>${arrow}<span>${t.submit}</span></button></div>
    <noscript><p>${t.noScript}</p></noscript>
  </form>`;
}

function home(lang) {
  const c = content[lang];
  const h = c.home;
  const a = alts[lang];
  const latest = briefings[0];
  return `<section class="hero hero-home" aria-labelledby="page-title">
      <img class="hero-image" src="${img(images.home)}" alt="" fetchpriority="high" decoding="async">
      <div class="hero-shade"></div>
      <div class="container hero-content" data-reveal-group="hero">
        <div class="hero-copy"><h1 id="page-title" lang="en">${h.title.map((t, i) => `<span data-reveal${i ? ' class="hero-light"' : ''}>${escape(t)}</span>`).join('')}</h1><p class="hero-lead" data-reveal>${escape(h.lead)}</p><p class="hero-text" data-reveal>${breaks(h.text)}</p></div>
        <a class="latest-bar" data-reveal href="${route(lang, 'market')}"><span class="latest-label">${escape(h.latest)} ${escape(latest.date)}</span><span class="latest-title" lang="ko">${escape(latest.title)}</span>${arrow}</a>
      </div>
    </section>
    ${split({ id: 'sourcing', size: 'tall', href: route(lang, 'sourcing'), file: images.homeSourcing, alt: a.sourcing, ...h.sourcing, extra: textLink(route(lang, 'sourcing'), c.more) })}
    ${split({ id: 'insight', tinted: true, reversed: true, href: route(lang, 'market'), file: images.homeInfo, alt: a.info, ...h.info, extra: `${briefingList(lang)}${button(`${route(lang, 'market')}#subscribe`, h.info.button)}` })}
    ${band({ id: 'partnership', file: images.homeTrust, alt: a.trust, ...h.trust })}
    ${split({ id: 'expertise', size: 'short', href: route(lang, 'about'), file: images.homeExpertise, alt: a.expertise, ...h.expertise, extra: textLink(route(lang, 'about'), c.more) })}
    ${contactBand(lang)}`;
}

function sourcing(lang) {
  const c = content[lang];
  const s = c.sourcing;
  const a = alts[lang];
  return `${pageHero(images.sourcing, s.title, s.text)}
    <section class="section"><div class="container card-grid" data-reveal-group>${card(images.commercial, a.commercial, s.commercial)}${card(images.specialty, a.specialty, s.specialty)}</div></section>
    <section class="section section-tinted"><div class="container"><h2 class="section-title centered" data-reveal>${escape(s.tilesTitle)}</h2>
      <div class="tiles" data-reveal-group>${s.tiles.map((word, i) => `<figure class="tile" data-reveal-image="up">${photo(images.tiles[i], s.tileAlts[i])}<figcaption><strong>${escape(word)}</strong><span>${escape(s.tileTexts[i])}</span></figcaption></figure>`).join('')}</div></div></section>
    ${contactBand(lang)}`;
}

function market(lang) {
  const c = content[lang];
  const m = c.market;
  const a = alts[lang];
  return `${pageHero(images.market, m.title, m.text)}
    <section class="section"><div class="container"><h2 class="section-title" data-reveal>${escape(m.listTitle)}</h2>
      <div class="briefing-table">${briefings.slice(0, 10).map(b => `<article class="briefing-row" data-reveal><p class="briefing-date">${escape(b.date)} (${escape(dayLabel(lang, b.day))})</p><div class="briefing-body" lang="ko"><h3>${escape(b.title)}</h3><p>${escape(b.line)}</p></div></article>`).join('')}</div>
      ${m.listNote ? `<p class="note">${escape(m.listNote).replace(/\[(.+?)\]/, '<a href="#subscribe">$1</a>')}</p>` : ''}</div></section>
    <section class="section section-tinted"><div class="container card-grid" data-reveal-group>${card(images.daily, a.daily, m.daily, true)}${card(images.monthly, a.monthly, m.monthly, true)}</div></section>
    <section class="section" id="subscribe"><div class="container form-layout" data-reveal-group>
      <div class="form-intro" data-reveal><h2 class="section-title">${escape(m.subscribeTitle)}</h2><p class="lead">${escape(m.subscribeText)}</p></div>
      <div data-reveal>${form(lang, 'subscribe')}</div></div></section>`;
}

function about(lang) {
  const c = content[lang];
  const h = c.home;
  const a = alts[lang];
  const v = c.about.values;
  const biz = c.about.business;
  return `${pageHero(images.about, c.about.title, c.about.text)}
    ${split({ id: 'expertise', file: images.aboutExpertise, alt: a.aboutExpertise, ...h.expertise })}
    <section class="section section-tinted" id="values"><div class="container">
      <div data-reveal><p class="label">${escape(v.label)}</p><h2 class="section-title">${escape(v.title)}</h2></div>
      <div class="values" data-reveal-group>${v.items.map(([title, text], i) => `<div class="value" data-reveal><img src="${img(images.values[i])}" width="64" height="64" alt="" loading="lazy"><h3>${escape(title)}</h3><p>${escape(text)}</p></div>`).join('')}</div>
    </div></section>
    <section class="section" id="business"><div class="container">
      <div data-reveal><p class="label">${escape(biz.label)}</p><h2 class="section-title">${escape(biz.title)}</h2></div>
      <div class="card-grid business" data-reveal-group>${card(images.aboutSourcing, a.aboutSourcing, [c.nav.sourcing, h.sourcing.text.replace('\n', ' ')], false, route(lang, 'sourcing'), c.more)}${card(images.aboutMarket, a.aboutMarket, [c.nav.market, h.info.text.replace('\n', ' ')], false, route(lang, 'market'), c.more)}</div>
    </div></section>
    ${band({ id: 'partnership', file: images.aboutTrust, alt: a.aboutTrust, ...h.trust })}
    ${contactBand(lang)}`;
}

function contactPage(lang) {
  const c = content[lang];
  const p = c.contactPage;
  return `${pageHero(images.contactHero, p.title, p.text)}
    <section class="section contact-section"><div class="container form-layout" data-reveal-group>
      <div class="contact-aside"><dl class="overview" data-reveal><div><dt>${p.email}</dt><dd><a href="mailto:${company.email}">${company.email}</a></dd></div><div><dt>${p.address}</dt><dd>${escape(lang === 'ko' ? company.address : company.addressEn)}</dd></div></dl><div class="contact-media" data-reveal-image="up">${photo(images.contact, alts[lang].contact, '', 'width="1065" height="1335"')}</div></div>
      <div data-reveal>${form(lang, 'contact')}</div>
    </div></section>`;
}

function legal(lang, page) {
  const c = content[lang];
  const sections = page === 'policy' ? c.legal.policySections : c.legal.privacySections;
  return `<section class="section legal-page"><div class="container legal-container"><h1 id="page-title">${c.titles[page]}</h1><p class="legal-intro">${escape(page === 'policy' ? c.legal.policyIntro : c.legal.privacyIntro)}</p><p class="legal-date">${c.legal.date}</p>${sections.map(([title, text], i) => `<section class="legal-section"${i === 0 && page === 'privacy' ? ' id="collection"' : ''}><h2>${i + 1}. ${escape(title)}</h2>${text.split('\n\n').map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</section>`).join('')}${textLink(route(lang, 'contact'), c.contactButton)}</div></section>`;
}

function notFound(lang) {
  const c = content[lang];
  return `<section class="not-found"><div class="container"><p class="label">404</p><h1 id="page-title">${escape(c.notFound.title)}</h1><p class="lead">${lines(c.notFound.text)}</p>${button(route(lang), c.backHome)}</div></section>`;
}

function document(lang, page) {
  const c = content[lang];
  const renderers = { home, sourcing, market, about, contact: contactPage, policy: legal, privacy: legal, '404': notFound };
  const body = renderers[page](lang, page);
  const title = page === 'home' ? `COMMECT | ${c.titles.home}` : `${c.titles[page]} | COMMECT`;
  const image = img(images[page] || images.home);
  const formKind = { contact: 'contact', market: 'subscribe' }[page];
  const client = formKind ? `<script type="application/json" id="inquiry-messages">${JSON.stringify(c[formKind]).replace(/</g, '\\u003c')}</script>` : '';
  return `<!DOCTYPE html>
<!-- Generated by scripts/build.mjs. Edit content/site.mjs and assets/ to make changes. -->
<html lang="${lang}" id="top"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(c.description)}">
<link rel="canonical" href="${company.origin}${route(lang, page)}">
${['ko', 'en'].map(l => `<link rel="alternate" hreflang="${l}" href="${company.origin}${route(l, page)}">`).join('')}
<link rel="alternate" hreflang="x-default" href="${company.origin}${route('ko', page)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="COMMECT"><meta property="og:locale" content="${c.locale}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(c.description)}"><meta property="og:url" content="${company.origin}${route(lang, page)}"><meta property="og:image" content="${company.origin}${image}">
${['policy', 'privacy', '404'].includes(page) ? '<meta name="robots" content="noindex,follow">' : ''}
<meta name="theme-color" content="#072340"><link rel="icon" type="image/svg+xml" sizes="any" href="/images/favicon.svg">
<link rel="preload" href="/vendor/fonts/${lang === 'en' ? 'inter/InterVariable.woff2' : 'pretendard/web/variable/woff2/PretendardVariable.woff2'}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script></head>
<body class="page-${page}" data-locale="${lang}">${header(lang, page, ['policy', 'privacy', '404'].includes(page))}<main id="main">${body}</main>${footer(lang)}${client}</body></html>\n`.replace(/[\t ]+$/gm, '');
}

// Only generated site files and referenced assets enter the deployment bundle.
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const lang of ['ko', 'en']) {
  for (const page of pages) {
    const relative = `${lang === 'en' ? 'en/' : ''}${page === 'home' ? 'index' : page}.html`;
    const html = document(lang, page);
    for (const base of [root, out]) {
      await mkdir(path.dirname(path.join(base, relative)), { recursive: true });
      await writeFile(path.join(base, relative), html);
    }
  }
}
await cp(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
const usedImages = new Set([...Object.values(images).flat(), 'brand/commect-wordmark-navy.png', 'brand/commect-wordmark-white.png', 'favicon.svg']);
for (const file of usedImages) {
  await mkdir(path.dirname(path.join(out, 'images', file)), { recursive: true });
  await cp(path.join(root, 'images', file), path.join(out, 'images', file));
}
const fontFiles = ['inter/InterVariable.woff2', 'inter/LICENSE.txt', 'pretendard/web/variable/woff2/PretendardVariable.woff2'];
for (const file of fontFiles) {
  await mkdir(path.dirname(path.join(out, 'vendor/fonts', file)), { recursive: true });
  await cp(path.join(root, 'vendor/fonts', file), path.join(out, 'vendor/fonts', file));
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['ko', 'en'].flatMap(l => pages.filter(p => !['404', 'policy', 'privacy'].includes(p)).map(p => `<url><loc>${company.origin}${route(l, p)}</loc></url>`)).join('')}</urlset>\n`;
for (const base of [root, out]) {
  await writeFile(path.join(base, 'sitemap.xml'), sitemap);
  await writeFile(path.join(base, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${company.origin}/sitemap.xml\n`);
}
console.log(`Built ${pages.length * 2} bilingual pages in dist/. Terms and privacy policy included.`);
