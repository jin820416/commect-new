import { mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { content, company, images, serviceIds, serviceImages, legacyAnchors } from '../content/site.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const pages = ['home', 'about', 'service', 'process', 'contact', 'policy', 'privacy', '404'];
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = value => escape(value).replace(/\n/g, '<br class="desktop-break"> ');
const img = file => `/images/${file}`;
const route = (lang, page = 'home') => `${lang === 'en' ? '/en' : ''}${page === 'home' ? (lang === 'en' ? '' : '/') : '/' + page}`;
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const globe = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" stroke="currentColor" stroke-width="1.4"/></svg>';
const button = (lang, label, page = 'contact', extra = '') => `<a class="button ${extra}" data-reveal href="${route(lang, page)}">${arrow}<span>${escape(label)}</span></a>`;

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
        ${['about', 'service', 'process', 'contact'].map((p, i) => `<a href="${route(lang, p)}"${p === page ? ' aria-current="page"' : ''}>${c.nav[i]}</a>`).join('')}
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
  return `<footer class="site-footer"><div class="container footer-grid">
    <a class="footer-brand" href="${route(lang)}" aria-label="COMMECT ${c.homeLabel}"><img src="/images/brand/commect-wordmark-navy.png" width="1024" height="240" alt="COMMECT — Commodity Connect" loading="lazy"></a>
    <div class="footer-details">
      <p>${company.legalName}<span class="separator">|</span>${c.footer.representative} ${company.representative}<span class="separator">|</span>${c.footer.registration}: ${company.registration}</p>
      <address>${escape(lang === 'ko' ? company.address : company.addressEn)}</address>
      <a class="footer-email" href="mailto:${company.email}">${company.email}</a>
      <div class="footer-bottom"><div class="footer-policies"><a href="${route(lang, 'policy')}">${c.titles.policy}</a><a href="${route(lang, 'privacy')}">${c.titles.privacy}</a></div><p class="copyright">${c.footer.copyright}</p></div>
    </div>
    <div class="footer-phone"><span>${c.footer.phone}</span><a href="tel:+821048365159">${lang === 'ko' ? company.phone : company.internationalPhone}</a></div>
  </div></footer>
  <a class="back-to-top" href="#top" aria-label="${lang === 'ko' ? '맨 위로' : 'Back to top'}" hidden data-top><svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="m5 15 7-7 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`;
}

function hero(lang, page) {
  const c = content[lang];
  const h = c.hero[page];
  const home = page === 'home';
  return `<section class="hero ${home ? 'hero-home' : 'hero-page'}" aria-labelledby="page-title">
    <img class="hero-image" src="${img(images[page])}" alt="" fetchpriority="high" decoding="async">
    <div class="hero-shade"></div><div class="container hero-content" data-reveal-group="hero">
      <h1 id="page-title" lang="en">${h.title.map((t, i) => `<span data-reveal${i ? ' class="hero-light"' : ''}>${escape(t)}</span>`).join('')}</h1>
      ${home ? `<p class="hero-lead" data-reveal>${escape(h.lead)}</p>` : ''}
      <p class="hero-description" data-reveal>${lines(h.text)}</p>
      ${home ? button(lang, c.contactButton, 'contact', 'button-light') : ''}
    </div></section>`;
}

function sectionHeading(label, title, text = '', extra = '') {
  return `<div class="section-heading ${extra}" data-reveal><p class="eyebrow" lang="en">/ ${escape(label)} /</p><h2>${lines(title)}</h2>${text ? `<p class="section-description">${lines(text)}</p>` : ''}</div>`;
}

function pillars(lang) {
  return `<div class="pillars" data-reveal-group>${content[lang].pillars.map(([title, text], i) => `<div class="pillar" data-reveal><img class="pillar-illustration" src="${img(images.pillars[i])}" width="64" height="64" alt="" loading="lazy" decoding="async"><div class="pillar-copy"><h3 lang="en">${escape(title)}</h3><p>${escape(text)}</p></div></div>`).join('')}</div>`;
}

function serviceCards(lang) {
  return `<div class="service-grid" data-reveal-group>${content[lang].services.map(([en, ko], i) => `<a class="service-card" data-reveal href="${route(lang, 'service')}#${serviceIds[i]}"><img src="${img(serviceImages[i])}" alt="" loading="lazy" width="640" height="420"><div class="service-card-shade"></div><div class="service-card-label"><h3 lang="en">${escape(en)}</h3>${lang === 'ko' ? `<p>${escape(ko)}</p>` : ''}</div><span class="service-card-arrow">${arrow}</span></a>`).join('')}</div>`;
}

function contactForm(lang) {
  const t = content[lang].contact;
  return `<form class="inquiry-form" data-inquiry-form novalidate>
    <p class="required-note">${t.requiredNote}</p><div class="form-grid">
    ${['name', 'company', 'phone', 'email'].map(key => `<div class="form-field"><label for="inquiry-${key}">${t.labels[key]}${['name', 'company', 'email'].includes(key) ? `<span class="required" aria-hidden="true">*</span>` : `<span class="optional">${t.optional}</span>`}</label><input id="inquiry-${key}" name="${key}" type="${key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}" autocomplete="${{name:'name', company:'organization', phone:'tel', email:'email'}[key]}" maxlength="${key === 'email' ? 254 : 120}"${key !== 'phone' ? ' required' : ''} aria-describedby="inquiry-status"></div>`).join('')}
    <div class="form-field field-full"><label for="inquiry-message">${t.labels.message}<span class="optional">${t.optional}</span></label><textarea id="inquiry-message" name="message" rows="5" maxlength="5000" placeholder="${t.placeholder}"></textarea></div>
    </div>
    <div class="form-trap" aria-hidden="true"><label for="inquiry-website">Website</label><input id="inquiry-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
    <div class="form-consent"><label><input type="checkbox" name="consent" required><span>${t.consent}</span></label><a href="${route(lang, 'privacy')}#collection">${t.privacyLink}</a></div>
    <p class="form-status" id="inquiry-status" role="status" aria-live="polite" tabindex="-1"></p>
    <div class="form-submit"><button class="button" type="submit" data-submit>${arrow}<span>${t.submit}</span></button></div>
    <noscript><p>${t.noScript}</p></noscript>
  </form>`;
}

function contactSection(lang, standalone = false) {
  const c = content[lang];
  return `<section class="section contact-section${standalone ? ' contact-standalone' : ''}" id="contact">
    <span id="s2025112800efcd7152995" class="legacy-anchor" aria-hidden="true"></span>
    <div class="container">${standalone ? `<div class="section-heading" data-reveal><p class="eyebrow" lang="en">/ CONTACT /</p><h1 id="page-title">${lines(c.contact.title)}</h1><p class="section-description">${escape(c.contact.text)}</p></div>` : sectionHeading('CONTACT', c.contact.title, c.contact.text)}
    <div class="contact-card" data-reveal>${contactForm(lang)}</div></div></section>`;
}

function contactCta(lang) {
  const c = content[lang];
  return `<section class="contact-cta"><div class="container cta-inner" data-reveal-group><div data-reveal><h2>${escape(c.cta.title)}</h2><p>${escape(c.cta.text)}</p></div>${button(lang, c.contactButton)}</div></section>`;
}

function home(lang) {
  const c = content[lang];
  return `${hero(lang, 'home')}
    <section class="section"><div class="container">${sectionHeading('WHO WE ARE', c.home.whoTitle, c.home.whoText)}${pillars(lang)}<div class="section-action">${button(lang, c.more, 'about')}</div></div></section>
    <section class="section section-tinted"><div class="container">${sectionHeading('OUR SERVICE', c.home.serviceTitle, c.home.serviceText)}${serviceCards(lang)}<div class="section-action">${button(lang, c.more, 'service')}</div></div></section>
    <section class="section why-section"><div class="container">${sectionHeading('WHY US', c.home.whyTitle)}<div class="why-list">${c.home.why.map(([word, title, text], i) => `<article class="split-row why-row${i % 2 ? ' is-reversed' : ''}" data-reveal-group><div class="split-copy" data-reveal><h3>${escape(title)}</h3><p>${escape(text)}</p><span class="decorative-word" lang="en" aria-hidden="true">${word}</span></div><div class="split-media" data-reveal><img src="${img(images.why[i])}" alt="${lang === 'ko' ? ['커피 산지의 가공 시설', '커피 농장 풍경', '커피와 함께하는 비즈니스 대화'][i] : ['Coffee processing at origin', 'A coffee farm landscape', 'A business conversation over coffee'][i]}" loading="lazy" width="690" height="450"></div></article>`).join('')}</div></div></section>
    ${contactSection(lang)}`;
}

function about(lang) {
  const c = content[lang];
  return `${hero(lang, 'about')}<section class="section"><div class="container">${sectionHeading('OUR APPROACH', c.about.title, c.about.text)}${pillars(lang)}</div></section>
    <section class="section section-tinted"><div class="container">${sectionHeading('NETWORK', c.about.networkTitle, c.about.networkText)}<div class="network-layout" data-reveal-group><div class="origin-gallery" data-reveal data-gallery role="region" aria-roledescription="${lang === 'ko' ? '사진 슬라이드' : 'carousel'}" aria-label="${c.about.photo}">
      <div class="gallery-images">${images.producers.map((file, i) => `<img src="${img('producers/' + file)}" alt="${c.about.photo} ${i + 1}" width="480" height="600"${i ? ' hidden loading="lazy"' : ''}>`).join('')}</div>
      <div class="gallery-controls"><button type="button" data-gallery-prev aria-label="${c.about.previous}"><span aria-hidden="true">←</span></button><span data-gallery-status aria-live="polite">1 / ${images.producers.length}</span><button type="button" data-gallery-next aria-label="${c.about.next}"><span aria-hidden="true">→</span></button></div></div>
      <div class="network-copy">${c.about.networkItems.map(([title, text]) => `<article data-reveal><h3>${escape(title)}</h3><p>${escape(text)}</p></article>`).join('')}</div></div></div></section>${contactCta(lang)}`;
}

function service(lang) {
  const c = content[lang];
  return `${hero(lang, 'service')}<div class="service-jump"><nav class="container service-jump-inner" aria-label="${lang === 'ko' ? '서비스 항목' : 'Service areas'}">${c.services.map(([en, title], i) => `<a href="#${serviceIds[i]}">${escape(title)}</a>`).join('')}</nav></div>
    <section class="section service-details"><div class="container">${c.services.map(([en, title, text], i) => `<article class="split-row service-row${i % 2 ? ' is-reversed' : ''}" data-reveal-group id="${serviceIds[i]}"><span class="legacy-anchor" id="${legacyAnchors[i]}" aria-hidden="true"></span><div class="split-media" data-reveal><img src="${img(serviceImages[i])}" alt="${escape(title)}" loading="lazy" width="690" height="450"></div><div class="split-copy" data-reveal>${lang === 'ko' ? `<p class="service-overline" lang="en">${en}</p>` : ''}<h2>${escape(title)}</h2><div class="copy-rule"></div><p>${escape(text)}</p></div></article>`).join('')}</div></section>${contactCta(lang)}`;
}

function processPage(lang) {
  const c = content[lang];
  return `${hero(lang, 'process')}<section class="section"><div class="container">${sectionHeading('WORKFLOW', c.process.title, c.process.text)}<ol class="process-grid" data-reveal-group>${c.process.steps.map(([title, text], i) => `<li class="process-card" data-reveal><div class="process-card-heading"><span class="step-number">${String(i + 1).padStart(2, '0')}</span><h3>${escape(title)}</h3></div><p>${escape(text)}</p></li>`).join('')}</ol></div></section>${contactCta(lang)}`;
}

function legal(lang, page) {
  const c = content[lang];
  const sections = page === 'policy' ? c.legal.policySections : c.legal.privacySections;
  return `<section class="section legal-page"><div class="container legal-container"><p class="eyebrow" lang="en">/ ${page === 'policy' ? 'TERMS OF USE' : 'PRIVACY POLICY'} /</p><h1 id="page-title">${c.titles[page]}</h1><p class="legal-intro">${escape(page === 'policy' ? c.legal.policyIntro : c.legal.privacyIntro)}</p><p class="legal-date">${c.legal.date}</p>${sections.map(([title, text], i) => `<section class="legal-section"${i === 0 && page === 'privacy' ? ' id="collection"' : ''}><h2>${i + 1}. ${escape(title)}</h2>${text.split('\n\n').map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</section>`).join('')}<a class="text-link" href="${route(lang, 'contact')}">${c.contactButton} ${arrow}</a></div></section>`;
}

function notFound(lang) {
  const c = content[lang];
  return `<section class="not-found"><div class="container"><p class="eyebrow">404</p><h1 id="page-title">${escape(c.notFound.title)}</h1><p>${lines(c.notFound.text)}</p>${button(lang, c.backHome, 'home')}</div></section>`;
}

function document(lang, page) {
  const c = content[lang];
  const solid = ['contact', 'policy', 'privacy', '404'].includes(page);
  const renderers = { home, about, service, process: processPage, contact: contactSection, policy: legal, privacy: legal, '404': notFound };
  const body = page === 'contact' ? contactSection(lang, true) : renderers[page](lang, page);
  const title = `${c.titles[page]} | COMMECT`;
  const image = img(images[page] || images.home);
  const client = ['home', 'contact'].includes(page) ? `<script type="application/json" id="inquiry-messages">${JSON.stringify(c.contact).replace(/</g, '\\u003c')}</script>` : '';
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
<link rel="preload" href="/vendor/fonts/inter/InterVariable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script></head>
<body class="page-${page}" data-locale="${lang}">${header(lang, page, solid)}<main id="main">${body}</main>${footer(lang)}${client}</body></html>\n`.replace(/[\t ]+$/gm, '');
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
const usedImages = new Set([images.home, images.about, images.service, images.process, ...images.why, ...images.pillars, ...serviceImages, ...images.producers.map(f => 'producers/' + f), 'brand/commect-wordmark-navy.png', 'brand/commect-wordmark-white.png', 'favicon.svg']);
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
const config = JSON.parse(await readFile(path.join(root, 'assets/inquiry-config.json'), 'utf8'));
if (!config.url.startsWith('https://') || !config.key || config.table !== 'inquiries_web') throw new Error('Invalid existing enquiry configuration');
console.log(`Built ${pages.length * 2} bilingual pages in dist/. Terms and privacy policy included.`);
