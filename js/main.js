/* Elevate HR Solutions: site behavior. No dependencies. */
(function () {
  'use strict';

  /* ---- CONFIG: fill these in when the client supplies them ---- */
  // Paste the Calendly link here until the site moves to Wix (on Wix, point the Book intro call buttons at the Calendly link instead).
  // While there is no link, every "Book" button scrolls to the contact section instead.
  var CALENDLY_URL = '';
  // Form service link (for example a Formspree address). While empty, the form opens the visitor's
  // email app with the message pre-filled, addressed to the client.
  var FORM_ENDPOINT = '';
  var BIZ = { email: 'chelsea@elevatehr.org', phone: '317-796-7914' };
  var CLIENT_EMAIL = BIZ.email;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Booking links */
  if (CALENDLY_URL) {
    $$('[data-book]').forEach(function (a) {
      a.href = CALENDLY_URL; a.target = '_blank'; a.rel = 'noopener';
    });
  }

  /* Footer year */
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* Hero headline stagger */
  $$('.h-display .w').forEach(function (w, i) { w.style.setProperty('--d', i); });

  /* Nav: soft edge once scrolled; mobile sheet */
  var nav = $('#nav'), toggle = $('#navToggle'), sheet = $('#navSheet');
  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
  }
  function closeSheet() {
    if (sheet.hidden) return;
    toggle.setAttribute('aria-expanded', 'false');
    sheet.classList.add('closing');
    var done = function () { sheet.hidden = true; sheet.classList.remove('closing'); };
    sheet.addEventListener('animationend', done, { once: true });
    setTimeout(function () { if (sheet.classList.contains('closing')) done(); }, 450);
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) { closeSheet(); return; }
    sheet.classList.remove('closing');
    sheet.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  });
  $$('a', sheet).forEach(function (a) { a.addEventListener('click', closeSheet); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { closeSheet(); toggle.focus(); } });
  document.addEventListener('click', function (e) { if (!sheet.hidden && !nav.contains(e.target)) closeSheet(); });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Services accordion (single open; the open panel can be closed) */
  /* Delegated, so the list keeps working when published content replaces it. */
  var svcList = $('.svc-list');
  if (svcList) svcList.addEventListener('click', function (e) {
    var btn = e.target.closest('button'); if (!btn || !svcList.contains(btn)) return;
    var item = btn.closest('.svc'), willOpen = !item.classList.contains('is-open');
    $$('.svc', svcList).forEach(function (o) {
      o.classList.remove('is-open');
      $('button', o).setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  /* Scroll reveals */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Hero pointer parallax: eased toward the pointer, like a spring with no overshoot */
  var visual = $('.hero-visual');
  if (visual && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
    var tick = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      visual.style.setProperty('--px', cx.toFixed(4));
      visual.style.setProperty('--py', cy.toFixed(4));
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(tick) : null;
    };
  }

  /* Contact form: inline validation, then endpoint or mailto fallback */
  var form = $('#contact-form'), status = $('#formStatus');
  if (form) {
  // Native constraint validation (required, type, pattern) with :user-invalid styling in CSS.
  // JS only keeps ARIA in sync: aria-invalid, the error linked via aria-describedby while it
  // shows, and one polite live region for errors that appear when a field is left.
  var announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.className = 'visually-hidden';
  document.body.appendChild(announcer);
  var announceTimer;
  function linkError(el, shown) {
    var id = el.dataset.error; if (!id) return;
    var ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== id; });
    if (shown) ids.push(id);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' ')); else el.removeAttribute('aria-describedby');
  }
  function syncAria(el, announce) {
    var invalid = el.matches(':user-invalid');
    el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    linkError(el, invalid);
    if (invalid && announce && el.dataset.error) {
      var label = el.labels && el.labels[0] ? el.labels[0].textContent.trim() + ': ' : '';
      var msg = 'Error: ' + $('#' + el.dataset.error).textContent.replace(/[^\w\s.@-]/g, '').trim();
      clearTimeout(announceTimer); announcer.textContent = '';
      announceTimer = setTimeout(function () { announcer.textContent = label + msg; }, 500);
    }
  }
  var fields = $$('input, textarea', form);
  fields.forEach(function (f) {
    syncAria(f);
    f.addEventListener('blur', function () { syncAria(f, true); });
    f.addEventListener('input', function () { syncAria(f); });
    // A failed submit fires 'invalid' on every failing field, untouched ones included.
    // Suppress the browser's own bubble (our inline error shows) and focus the first one.
    f.addEventListener('invalid', function (e) {
      e.preventDefault(); syncAria(f);
      if (f === form.querySelector(':invalid')) f.focus();
    });
  });
  form.addEventListener('reset', function () { setTimeout(function () { fields.forEach(function (f) { syncAria(f); }); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var data = {};
    fields.forEach(function (f) { data[f.name] = f.value.trim(); });
    var endpoint = FORM_ENDPOINT;
    if (endpoint) {
      data._subject = 'Intro call request' + (data.company ? ' - ' + data.company : ''); data.source = 'Website intro call form';
      status.textContent = 'Sending...';
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); status.textContent = 'Thank you. We will be in touch soon.'; form.reset(); })
        .catch(function () { status.textContent = 'That did not send. Please email ' + CLIENT_EMAIL + ' or call ' + BIZ.phone + '.'; });
    } else {
      var subject = 'Intro call inquiry' + (data.company ? ' - ' + data.company : '');
      var body = data.message + '\n\n' + data.name + (data.company ? '\n' + data.company : '') + '\n' + data.email;
      window.location.href = 'mailto:' + CLIENT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      // Not every visitor has an email app, so never rely on it alone: offer a copy of the message.
      var full = 'To: ' + CLIENT_EMAIL + '\nSubject: ' + subject + '\n\n' + body;
      status.textContent = 'Your email app should open with your message. If nothing happens, ';
      var copy = document.createElement('button');
      copy.type = 'button'; copy.className = 'link-btn'; copy.textContent = 'copy your message';
      copy.addEventListener('click', function () {
        var done = function () { status.textContent = 'Copied. Paste it into an email to ' + CLIENT_EMAIL + ', or call ' + BIZ.phone + '.'; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(full).then(done, done);
        else done();
      });
      status.appendChild(copy);
      status.appendChild(document.createTextNode(' or email ' + CLIENT_EMAIL + ' directly.'));
    }
  });
  }
})();
