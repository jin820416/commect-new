(() => {
  'use strict';
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('.menu-toggle');
  const topLink = document.querySelector('[data-top]');
  function closeMenu(returnFocus = false) {
    if (!menu) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', menu.dataset.openLabel);
    header.classList.remove('menu-open');
    if (returnFocus) menu.focus();
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? menu.dataset.closeLabel : menu.dataset.openLabel);
    header.classList.toggle('menu-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (header && !header.contains(event.target)) closeMenu();
  });
  document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => closeMenu()));
  matchMedia('(min-width: 992px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  function updateScroll() {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
    if (topLink) topLink.hidden = window.scrollY < 500;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // Preserve the current section when switching language.
  let initialAnchor;
  try { initialAnchor = decodeURIComponent(location.hash.slice(1)); } catch { initialAnchor = ''; }
  document.querySelectorAll('.language-link').forEach(link => {
    if (initialAnchor && document.getElementById(initialAnchor)) link.hash = location.hash;
  });
  window.addEventListener('hashchange', () => {
    document.querySelectorAll('.language-link').forEach(link => { link.hash = location.hash; });
  });

  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const photos = [...gallery.querySelectorAll('.gallery-images img')];
    const status = gallery.querySelector('[data-gallery-status]');
    let active = 0;
    function show(offset) {
      photos[active].hidden = true;
      active = (active + offset + photos.length) % photos.length;
      photos[active].hidden = false;
      status.textContent = `${active + 1} / ${photos.length}`;
    }
    gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => show(-1));
    gallery.querySelector('[data-gallery-next]').addEventListener('click', () => show(1));
  });

  // Keep content visible by default; effects never depend on a hidden CSS state.
  function initializeMotion() {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || typeof IntersectionObserver !== 'function' ||
        typeof document.documentElement?.animate !== 'function') return;
    const active = new Set();
    const observer = new IntersectionObserver(entries => {
      const groups = new Map();
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        observer.unobserve(element);
        if (preference.matches || element.contains(document.activeElement)) return;
        const group = element.closest('[data-reveal-group]');
        const hero = group?.dataset.revealGroup === 'hero';
        const index = group ? (groups.get(group) || 0) : 0;
        if (group) groups.set(group, index + 1);
        // Photos open like a curtain from their outer edge while settling from a slight zoom.
        if (element.hasAttribute('data-reveal-image')) {
          const from = { left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)' }[element.dataset.revealImage] || 'inset(100% 0 0 0)';
          const delay = Math.min(index * 120, 360);
          const photo = element.querySelector('img');
          [
            element.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, delay, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' }),
            photo?.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 1600, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }),
          ].filter(Boolean).forEach(animation => {
            active.add(animation);
            const done = () => active.delete(animation);
            animation.finished.then(done, done);
          });
          return;
        }
        const animation = element.animate([
          { opacity: 0, transform: `translateY(${hero ? 18 : 24}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ], {
          duration: hero ? 760 : 680,
          delay: Math.min(index * (hero ? 90 : 80), hero ? 360 : 240),
          easing: 'cubic-bezier(.22,1,.36,1)',
          fill: 'backwards',
        });
        element.dataset.revealState = 'running';
        active.add(animation);
        const finish = () => {
          active.delete(animation);
          element.dataset.revealState = 'complete';
        };
        animation.finished.then(finish, finish);
      });
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('[data-reveal], [data-reveal-image]').forEach(element => observer.observe(element));
    preference.addEventListener('change', event => {
      if (!event.matches) return;
      observer.disconnect();
      active.forEach(animation => animation.cancel());
    });
  }
  initializeMotion();

  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const messages = JSON.parse(document.getElementById('inquiry-messages').textContent);
  const status = form.querySelector('[role=status]');
  const button = form.querySelector('[data-submit]');
  const label = button.querySelector('span');
  let pending = false;
  const openedAt = Date.now();   // the server ignores forms submitted implausibly fast
  // Contact page: the briefing mail consent shows (and is required) only for the briefing inquiry type.
  const briefingConsent = form.querySelector('[data-briefing-consent]');
  function syncBriefingConsent() {
    if (!briefingConsent) return;
    const show = Boolean(form.querySelector('input[name=kind]:checked')?.hasAttribute('data-briefing'));
    const box = briefingConsent.querySelector('input');
    briefingConsent.hidden = !show;
    box.required = show;
    if (!show) box.checked = false;
  }
  form.addEventListener('change', syncBriefingConsent);
  syncBriefingConsent();

  function notify(message, error = false) {
    status.textContent = message;
    status.classList.toggle('is-error', error);
  }
  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
    if (event.target.setCustomValidity) event.target.setCustomValidity('');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(form);
    const payload = Object.fromEntries(['kind', 'name', 'company', 'phone', 'email', 'message', 'website'].map(key => [key, String(data.get(key) || '').trim()]));
    payload.consent = Boolean(form.elements.namedItem('consent')?.checked);
    const mailConsent = form.elements.namedItem('consent_mail');
    if (mailConsent) payload.consent_mail = Boolean(mailConsent.checked);
    payload.lang = document.documentElement?.lang === 'en' ? 'en' : 'ko';
    for (const key of ['name', 'company', 'email', 'phone']) {
      const input = form.elements.namedItem(key);
      input.setCustomValidity(payload[key] ? '' : messages.invalid);
      input.setAttribute('aria-invalid', String(!input.validity.valid));
    }
    if (!form.checkValidity()) {
      notify(messages.invalid, true);
      form.reportValidity();
      return;
    }
    if (data.get('website')) { notify(messages.failure, true); return; }
    if (!navigator.onLine) { notify(messages.offline, true); return; }
    pending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    label.textContent = messages.sending;
    notify('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      payload.elapsed = Date.now() - openedAt;
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      if (response.status === 400) { notify(messages.invalid, true); status.focus({ preventScroll: true }); return; }
      if (response.status === 429) { notify(messages.busy, true); status.focus({ preventScroll: true }); return; }
      if (!response.ok) throw new Error('Inquiry was not delivered');
      form.reset();
      syncBriefingConsent();
      form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
      notify(messages.success);
      status.focus({ preventScroll: true });
    } catch {
      notify(messages.failure, true);
      status.focus({ preventScroll: true });
    } finally {
      clearTimeout(timeout);
      pending = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
      label.textContent = messages.submit;
    }
  });
})();
