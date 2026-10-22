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

  // Preserve the service section when switching language, including older anchors.
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
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
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
  let configPromise;

  function notify(message, error = false) {
    status.textContent = message;
    status.classList.toggle('is-error', error);
  }
  function configuration(signal) {
    if (!configPromise) {
      configPromise = fetch('/assets/inquiry-config.json', { cache: 'no-cache', signal })
        .then(response => { if (!response.ok) throw new Error('Configuration unavailable'); return response.json(); })
        .catch(error => { configPromise = null; throw error; });
    }
    return configPromise;
  }
  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
    if (event.target.setCustomValidity) event.target.setCustomValidity('');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(form);
    const payload = Object.fromEntries(['name', 'company', 'phone', 'email', 'message'].map(key => [key, String(data.get(key) || '').trim()]));
    for (const key of ['name', 'company', 'email']) {
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
      const config = await configuration(controller.signal);
      const endpoint = new URL(`/rest/v1/${encodeURIComponent(config.table)}`, config.url);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      if (!response.ok) throw new Error('Enquiry was not accepted');
      form.reset();
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
