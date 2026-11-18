/* Elevate HR Solutions: site behavior. No dependencies. */
(function () {
  'use strict';

  /* ---- CONFIG: fill these in when the client supplies them ---- */
  // Real Calendly scheduling link (e.g. https://calendly.com/<name>/intro). While empty,
  // every "Book" button scrolls to the contact section instead.
  var CALENDLY_URL = '';
  // Form handler endpoint (e.g. a Formspree URL). While empty, the form opens the visitor's
  // email app with the message pre-filled, addressed to the client.
  var FORM_ENDPOINT = '';
  var CLIENT_EMAIL = 'chelsea@elevatehr.org';

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
    updateBar();
  }
  function closeSheet() { toggle.setAttribute('aria-expanded', 'false'); sheet.hidden = true; }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    sheet.hidden = open;
  });
  $$('a', sheet).forEach(function (a) { a.addEventListener('click', closeSheet); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { closeSheet(); toggle.focus(); } });
  document.addEventListener('click', function (e) { if (!sheet.hidden && !nav.contains(e.target)) closeSheet(); });

  /* Mobile action bar: appears after the hero CTAs leave, hides at the contact section */
  var bar = $('#mobileBar'), heroCta = $('.hero .cta-row'), contact = $('#contact');
  function updateBar() {
    if (!bar) return;
    var heroBottom = heroCta.getBoundingClientRect().bottom;
    var contactTop = contact.getBoundingClientRect().top;
    bar.classList.toggle('show', heroBottom < 0 && contactTop > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Services accordion (single open; the open panel can be closed) */
  var items = $$('.svc');
  items.forEach(function (item) {
    var btn = $('button', item);
    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');
      items.forEach(function (o) {
        o.classList.remove('is-open');
        $('button', o).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
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
  function setErr(field, msg) {
    var wrap = field.closest('.field'); var out = $('.err', wrap);
    wrap.classList.toggle('invalid', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (out) out.textContent = msg || '';
  }
  function validate(field) {
    var v = field.value.trim();
    if (field.required && !v) { setErr(field, 'Please fill this in.'); return false; }
    if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErr(field, 'Enter an email like name@company.com.'); return false; }
    setErr(field, ''); return true;
  }
  $$('input, textarea', form).forEach(function (f) {
    f.addEventListener('blur', function () { if (f.value || f.closest('.invalid')) validate(f); });
    f.addEventListener('input', function () { if (f.closest('.invalid')) validate(f); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = $$('input, textarea', form);
    var firstBad = null;
    fields.forEach(function (f) { if (!validate(f) && !firstBad) firstBad = f; });
    if (firstBad) { firstBad.focus(); status.textContent = ''; return; }
    var data = {};
    fields.forEach(function (f) { data[f.name] = f.value.trim(); });
    if (FORM_ENDPOINT) {
      status.textContent = 'Sending...';
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); status.textContent = 'Thank you. I will be in touch soon.'; form.reset(); })
        .catch(function () { status.textContent = 'That did not send. Please email ' + CLIENT_EMAIL + ' or call 317-796-7914.'; });
    } else {
      var subject = 'Intro call inquiry' + (data.company ? ' - ' + data.company : '');
      var body = data.message + '\n\n' + data.name + (data.company ? '\n' + data.company : '') + '\n' + data.email;
      window.location.href = 'mailto:' + CLIENT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Opening your email app. You can also write to ' + CLIENT_EMAIL + '.';
    }
  });
})();
