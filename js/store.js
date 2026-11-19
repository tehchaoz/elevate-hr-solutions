/* Elevate HR Solutions: content store + public-page rendering.
   DEMO: edits are saved in this browser (localStorage) only. See README. */
(function () {
  'use strict';
  var KEY = 'elevate.content.v1';
  var DEFAULTS = {"services": [{"id": "s1", "title": "HR Infrastructure & Compliance", "items": ["Comprehensive HR audit", "Employee handbook and policy updates", "Employment law compliance and risk management", "Process development and optimization", "End-to-end M&A support"]}, {"id": "s2", "title": "Talent Acquisition & Onboarding", "items": ["Customized hiring strategies and recruiting support", "New hire orientation", "Onboarding program development"]}, {"id": "s3", "title": "Performance & Culture", "items": ["Employee engagement and retention strategies", "Team-building initiatives", "Behavioral assessments", "Performance management systems", "Coaching and leadership development", "Workforce planning and organizational design", "Customized training programs"]}, {"id": "s4", "title": "Payroll, Benefits & Operations Support", "items": ["Payroll and benefits administration", "Total compensation strategies", "Bookkeeping and administrative support"]}], "faq": [{"q": "Is the first call really free?", "a": "Yes. The introductory call is complimentary and carries absolutely no obligation."}, {"q": "What if I only need help with one thing?", "a": "That works. We can step in as a one-time project partner, such as an HR audit or a handbook update, or stay on as ongoing HR support."}, {"q": "Can you handle payroll, benefits and bookkeeping too?", "a": "Yes. Alongside HR, we offer payroll and benefits administration, total compensation strategies, and light bookkeeping and administrative support."}, {"q": "What kinds of businesses do you work with?", "a": "Our experience spans engineering, healthcare, hospitality, technology and construction, including multi-state organizations navigating growth, transformation, and increasing organizational complexity."}, {"q": "Where are you based?", "a": "Tampa, Florida. You can reach us at 317-796-7914 or chelsea@elevatehr.org."}], "team": [{"id": "owner", "name": "Chelsea Shumaker, PHR", "role": "Founder / Principal HR Consultant", "bio": "I’ve spent 22 years rolling up my sleeves in HR roles across a wide range of industries, helping organizations establish the right structure, navigate complex people challenges, and create a workplace where teams can thrive. I’m committed to helping companies build and sustain high-performing cultures while ensuring the people, processes, and HR infrastructure behind them operate effectively.", "photo": "assets/chelsea-headshot.jpg"}], "pw": "pbkdf2$200000$68a0db86aa21e964a7ab6b499bb68358$441680090adaa519bfa55533931782c8e2cf97fec6fdd7969ee9290424265032"};

  /* Sections whose background and text colours can be changed in Admin. */
  var SECTIONS = [
    { key: 'hero', label: 'Top of page', note: 'Headline and photo', page: 'Home', bg: '#f7f4ea', text: '#16224f' },
    { key: 'services', label: 'Areas of support', note: 'Services list', page: 'Home', bg: '#16224f', text: '#f7f4ea' },
    { key: 'working', label: 'Project, interim, ongoing', note: 'The three support cards', page: 'Home', bg: '#d6ece9', text: '#16224f' },
    { key: 'why', label: 'Why partner with us', note: 'Four reasons', page: 'Home', bg: '#f7f4ea', text: '#16224f' },
    { key: 'testimonial', label: 'Client testimonial', note: 'Quote section', page: 'Home', bg: '#16224f', text: '#f7f4ea' },
    { key: 'faq', label: 'Questions', note: 'FAQ list', page: 'Home', bg: '#f7f4ea', text: '#16224f' },
    { key: 'contact', label: "Let's connect", note: 'Contact and form', page: 'Home', bg: '#16224f', text: '#f7f4ea' },
    { key: 'about-intro', label: 'About: introduction', note: 'Top of the About page', page: 'About', bg: '#f7f4ea', text: '#16224f' },
    { key: 'team', label: 'About: team', note: 'Meet the team', page: 'About', bg: '#16224f', text: '#f7f4ea' },
    { key: 'footer', label: 'Footer', note: 'Bottom of every page', page: 'All pages', bg: '#0f1838', text: '#f7f4ea' }
  ];
  var PALETTE = [
    { name: 'Navy', hex: '#16224f' }, { name: 'Deep navy', hex: '#0f1838' }, { name: 'Cream', hex: '#f7f4ea' },
    { name: 'White', hex: '#ffffff' }, { name: 'Light green', hex: '#d6ece9' }, { name: 'Logo green', hex: '#8fc8c2' },
    { name: 'Dark green', hex: '#40827b' }, { name: 'Charcoal', hex: '#2b2f3a' }
  ];

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  var Store = {
    SECTIONS: SECTIONS, PALETTE: PALETTE,
    has: function (k) { return read()[k] !== undefined; },
    get: function (k) { var v = read()[k]; return v !== undefined ? v : (DEFAULTS[k] !== undefined ? clone(DEFAULTS[k]) : null); },
    set: function (k, v) { var o = read(); o[k] = v; return write(o); },
    reset: function (k) { var o = read(); delete o[k]; return write(o); },
    exportAll: function () { return JSON.stringify(read(), null, 2); },
    importAll: function (txt) { var o = JSON.parse(txt); if (!o || typeof o !== 'object') throw new Error('bad'); return write(o); },
    ok: function (x) { return /^#[0-9a-f]{6}$/i.test(x); }
  };

  /* ---- password hashing: salted PBKDF2, never stored as text ---- */
  function hex(b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  function unhex(s) { var a = new Uint8Array(s.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(s.substr(i * 2, 2), 16); return a; }
  Store.hash = function (pw, saltHex, iters) {
    var salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16)); iters = iters || 200000;
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits'])
      .then(function (k) { return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: iters }, k, 256); })
      .then(function (b) { return 'pbkdf2$' + iters + '$' + hex(salt) + '$' + hex(b); });
  };
  Store.verify = function (pw, stored) {
    var p = String(stored || '').split('$'); if (p[0] !== 'pbkdf2' || p.length !== 4) return Promise.resolve(false);
    return Store.hash(pw, p[2], parseInt(p[1], 10)).then(function (h) {
      var a = h, b = stored, d = a.length ^ b.length; for (var i = 0; i < a.length && i < b.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0;
    });
  };
  Store.defaultAdmins = function () { return [{ id: 'a1', name: 'Chelsea Shumaker', email: 'chelsea@elevatehr.org', pw: DEFAULTS.pw, mustChange: true }]; };
  Store.admins = function () { var a = read().admins; return a && a.length ? a : Store.defaultAdmins(); };

  /* ---- tiny DOM helper (text only: no innerHTML with stored data) ---- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'text') n.textContent = attrs[k]; else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  Store.el = el;

  /* ---- public pages ---- */
  function applyTheme() {
    var t = Store.has('theme') ? Store.get('theme') : null; if (!t) return;
    var css = '';
    SECTIONS.forEach(function (s) {
      var c = t[s.key]; if (!c) return;
      if (c.bg && Store.ok(c.bg)) css += '[data-sec="' + s.key + '"]{background:' + c.bg + '!important}';
      if (c.text && Store.ok(c.text)) css += '[data-sec="' + s.key + '"]{color:' + c.text + '!important}[data-sec="' + s.key + '"] :is(h1,h2,.h-section,.muted,.lede,.page-lede,.hero-sig,.hero-sig strong,.hero-sig span,.why dt,.why dd,.on-dark,.on-dark-muted,.footer-meta,.footer-grid>p,.footer a,.contact-list a,.split-head p){color:' + c.text + '!important}';
    });
    if (css) { var st = document.createElement('style'); st.id = 'elevate-theme'; st.textContent = css; document.head.appendChild(st); }
  }
  function renderServices() {
    var list = document.querySelector('.svc-list'); if (!list || !Store.has('services')) return;
    var data = Store.get('services'); list.textContent = '';
    data.forEach(function (s, i) {
      var id = 'svc' + (i + 1), open = i === 0;
      var btn = el('button', { type: 'button', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': id, id: id + '-btn' }, [el('span', { text: s.title }), el('i', { 'aria-hidden': 'true' })]);
      var ul = el('ul', { 'class': 'checks' }, (s.items || []).map(function (t) { return el('li', { text: t }); }));
      var panel = el('div', { 'class': 'svc-panel', id: id, role: 'region', 'aria-labelledby': id + '-btn' }, [el('div', { 'class': 'svc-inner' }, [ul])]);
      list.appendChild(el('div', { 'class': 'svc' + (open ? ' is-open' : '') }, [el('h3', {}, [btn]), panel]));
    });
  }
  function renderFaq() {
    var box = document.querySelector('.faq'); if (!box || !Store.has('faq')) return;
    box.textContent = '';
    Store.get('faq').forEach(function (f, i) {
      var d = el('details', { name: 'faq' }, [el('summary', { text: f.q }), el('p', { text: f.a })]); if (i === 0) d.setAttribute('open', ''); box.appendChild(d);
    });
  }
  function renderTeam() {
    var box = document.querySelector('.team'); if (!box || !Store.has('team')) return;
    box.textContent = '';
    Store.get('team').forEach(function (m, i) {
      var img = el('img', { width: '281', height: '281', alt: 'Portrait of ' + m.name, loading: 'lazy' });
      var src = String(m.photo || ''); if (/^(assets\/|data:image\/(jpeg|png|webp);base64,)/.test(src)) img.setAttribute('src', src);
      var body = el('div', { 'class': 'member-body' }, [el('h3', { text: m.name }), el('p', { 'class': 'member-role', text: m.role }), el('p', { text: m.bio })]);
      box.appendChild(el('article', { 'class': 'member' + (i === 0 ? ' member-lead' : '') }, [el('div', { 'class': 'member-photo' }, [img]), body]));
    });
  }
  if (document.querySelector('[data-sec]') || document.querySelector('.svc-list') || document.querySelector('.faq') || document.querySelector('.team')) {
    applyTheme(); renderServices(); renderFaq(); renderTeam();
  }
  window.ElevateStore = Store;
})();
