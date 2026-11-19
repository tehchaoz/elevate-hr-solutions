/* Elevate HR Solutions: content store + public-page rendering.
   Admin edits are a draft saved in the admin's browser and shown only in Admin's preview. See README. */
(function () {
  'use strict';
  var KEY = 'elevate.content.v1';      /* admin working copy (draft), this browser only */
  var SYNC = ['theme', 'services', 'faq', 'team', 'testimonials', 'settings', 'business'];   /* the content areas an admin can edit */
  var live = {}, mode = 'live';   /* live stays empty: visitors see the page as written; only Admin's preview reads the draft */
  var DEFAULTS = {"services": [{"id": "s1", "title": "HR Infrastructure & Compliance", "items": ["Comprehensive HR audit", "Employee handbook and policy updates", "Employment law compliance and risk management", "Process development and optimization", "End-to-end M&A support"]}, {"id": "s2", "title": "Talent Acquisition & Onboarding", "items": ["Customized hiring strategies and recruiting support", "New hire orientation", "Onboarding program development"]}, {"id": "s3", "title": "Performance & Culture", "items": ["Employee engagement and retention strategies", "Team-building initiatives", "Behavioral assessments", "Performance management systems", "Coaching and leadership development", "Workforce planning and organizational design", "Customized training programs"]}, {"id": "s4", "title": "Payroll, Benefits & Operations Support", "items": ["Payroll and benefits administration", "Total compensation strategies", "Bookkeeping and administrative support"]}], "faq": [{"q": "Is the first call really free?", "a": "Yes. The introductory call is complimentary and carries absolutely no obligation."}, {"q": "What if I only need help with one thing?", "a": "That works. We can step in as a one-time project partner, such as an HR audit or a handbook update, or stay on as ongoing HR support."}, {"q": "Can you handle payroll, benefits and bookkeeping too?", "a": "Yes. Alongside HR, we offer payroll and benefits administration, total compensation strategies, and light bookkeeping and administrative support."}, {"q": "What kinds of businesses do you work with?", "a": "Our experience spans engineering, healthcare, hospitality, technology and construction, including multi-state organizations navigating growth, transformation, and increasing organizational complexity."}, {"q": "Where are you based?", "a": "{location}. You can reach us at {phone} or {email}."}], "team": [{"id": "owner", "name": "Chelsea Shumaker, PHR", "role": "Founder / Principal HR Consultant", "bio": "I’ve spent 22 years rolling up my sleeves in HR roles across a wide range of industries, helping organizations establish the right structure, navigate complex people challenges, and create a workplace where teams can thrive. I’m committed to helping companies build and sustain high-performing cultures while ensuring the people, processes, and HR infrastructure behind them operate effectively.", "photo": "assets/chelsea-headshot.jpg"}], "pw": "pbkdf2$200000$68a0db86aa21e964a7ab6b499bb68358$441680090adaa519bfa55533931782c8e2cf97fec6fdd7969ee9290424265032"};
  DEFAULTS.testimonials = [{"id": "t1", "headline": "What stood out most was their incredible flexibility.", "quote": "I am pleased to highly recommend Chelsea and her team at Elevate HR Solutions for their exceptional human resources consulting services.\n\nOur organization partnered with Elevate HR Solutions during a critical period of personnel changes within our HR department. What stood out most was their incredible flexibility. They seamlessly stepped into a full-scale HR management role and then scaled down to limited support as we successfully transitioned operations back in-house with a new HR Manager hire.\n\nChelsea and her consultants were extremely responsive, highly available, and consistently reliable. They integrated into our workflow perfectly.", "name": "Marlin Knowles", "title": "Director of Operations, USI", "link": "https://www.linkedin.com/posts/elevate-hrsolutions_elevatehrsolutions-hrconsulting-fractionalhr-activity-7496007592385748992-28cl", "linkText": "View the original on LinkedIn, August 7, 2026"}];
  DEFAULTS.pw0 = "pbkdf2$200000$de90ddf7bbebac1e39beb7072567f981$edef49d1e9c977d46c0588865c6e5784ab18ca64857b79a1a1625138852ff319";
  DEFAULTS.settings = {"calendly": ""};
  DEFAULTS.business = { phone: "317-796-7914", email: "chelsea@elevatehr.org", location: "Tampa, Florida", hours: "", linkedin: "https://www.linkedin.com/company/elevate-hrsolutions", facebook: "", instagram: "" };

  /* Sections whose background and text colours can be changed in Admin. */
  var SECTIONS = [
    { key: 'hero', label: 'Top of page', note: 'Headline and photo', page: 'Home', bg: '#f7f4ea', text: '#16224f' },
    { key: 'services', label: 'Areas of support', note: 'Services list', page: 'Home', bg: '#16224f', text: '#f7f4ea' },
    { key: 'working', label: 'Project, interim, ongoing', note: 'The three support cards', page: 'Home', bg: '#d6ece9', text: '#16224f' },
    { key: 'why', label: 'Why partner with us', note: 'Four reasons', page: 'Home', bg: '#f7f4ea', text: '#16224f' },
    { key: 'testimonial', label: 'Client testimonial', note: 'Quote section', page: 'Home', bg: '#16224f', text: '#f7f4ea' },
    { key: 'faq', label: 'Questions', note: 'FAQ list', page: 'Home', bg: '#f7f4ea', text: '#16224f' },
    { key: 'contact', label: "Let's connect", note: 'Contact and form', page: 'Home', bg: '#16224f', text: '#f7f4ea' },
    { key: 'about-intro', label: 'About Us: introduction', note: 'Top of the About Us page', page: 'About Us', bg: '#f7f4ea', text: '#16224f' },
    { key: 'team', label: 'About Us: team', note: 'Meet the team', page: 'About Us', bg: '#16224f', text: '#f7f4ea' },
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
  function ok(x) { return typeof x === 'string' && /^#[0-9a-f]{6}$/i.test(x); }
  function url(x) { return typeof x === 'string' && /^https:\/\/[^\s<>"']{3,480}$/i.test(x.trim()) ? x.trim() : ''; }
  function str(x, n) { return typeof x === 'string' ? x.slice(0, n) : ''; }
  function stable(v) {
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(v[k]); }).join(',') + '}';
    return JSON.stringify(v);
  }
  /* Anything that comes from a saved draft or an imported backup is checked here before it is rendered. */
  function clean(o) {
    var out = {}; if (!o || typeof o !== 'object') return out;
    if (o.theme && typeof o.theme === 'object' && !Array.isArray(o.theme)) {
      var t = {}; Object.keys(o.theme).forEach(function (k) {
        var c = o.theme[k]; if (!c || typeof c !== 'object') return;
        var r = {}; if (ok(c.bg)) r.bg = c.bg; if (ok(c.text)) r.text = c.text; if (r.bg || r.text) t[k] = r;
      });
      if (Object.keys(t).length) out.theme = t;
    }
    if (Array.isArray(o.services)) out.services = o.services.filter(function (x) { return x && typeof x.title === 'string'; }).slice(0, 30).map(function (x) {
      return { id: str(String(x.id || ''), 40), title: str(x.title, 90), items: (Array.isArray(x.items) ? x.items : []).filter(function (i) { return typeof i === 'string'; }).slice(0, 40).map(function (i) { return str(i, 300); }) };
    });
    if (Array.isArray(o.faq)) out.faq = o.faq.filter(function (x) { return x && typeof x.q === 'string' && typeof x.a === 'string'; }).slice(0, 60).map(function (x) { return { q: str(x.q, 160), a: str(x.a, 1200) }; });
    if (Array.isArray(o.team)) out.team = o.team.filter(function (x) { return x && typeof x.name === 'string'; }).slice(0, 40).map(function (x) {
      return { id: str(String(x.id || ''), 40), name: str(x.name, 80), role: str(x.role, 90), bio: str(x.bio, 1500), photo: str(x.photo, 400000) };
    });
    if (Array.isArray(o.testimonials)) out.testimonials = o.testimonials.filter(function (x) { return x && typeof x.name === 'string' && typeof x.quote === 'string'; }).slice(0, 30).map(function (x) {
      return { id: str(String(x.id || ''), 40), headline: str(x.headline, 200), quote: str(x.quote, 4000), name: str(x.name, 80), title: str(x.title, 120), link: url(x.link), linkText: str(x.linkText, 120) };
    });
    if (o.settings && typeof o.settings === 'object' && !Array.isArray(o.settings)) out.settings = { calendly: url(o.settings.calendly), formEndpoint: url(o.settings.formEndpoint), entriesUrl: url(o.settings.entriesUrl) };
    if (o.business && typeof o.business === 'object' && !Array.isArray(o.business)) {
      var b = o.business, nb = {};
      nb.phone = /^[0-9 ()+.\-]{7,24}$/.test(String(b.phone || '').trim()) ? String(b.phone).trim() : '';
      nb.email = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,200}\.[^\s@<>"']{2,}$/.test(String(b.email || '').trim()) ? String(b.email).trim() : '';
      nb.location = str(b.location, 120).trim(); nb.hours = str(b.hours, 200).trim();
      nb.linkedin = url(b.linkedin); nb.facebook = url(b.facebook); nb.instagram = url(b.instagram);
      out.business = nb;
    }
    return out;
  }
  function cur() { return mode === 'draft' ? read() : live; }
  /* Set by admin.js while an admin is logged in (shared across tabs, so "View site" can preview the draft). */
  function sessionActive() { try { return parseInt(localStorage.getItem('elevate.prev'), 10) > Date.now(); } catch (e) { return false; } }

  var Store = {
    SECTIONS: SECTIONS, PALETTE: PALETTE,
    has: function (k) { return cur()[k] !== undefined; },
    get: function (k) { var v = cur()[k]; return v !== undefined ? v : (DEFAULTS[k] !== undefined ? clone(DEFAULTS[k]) : null); },
    set: function (k, v) { var o = read(); o[k] = v; return write(o); },
    reset: function (k) { var o = read(); delete o[k]; return write(o); },
    exportAll: function () { return JSON.stringify(read(), null, 2); },
    importAll: function (txt) { var o = JSON.parse(txt); if (!o || typeof o !== 'object') throw new Error('bad'); var c = clean(o); if (Array.isArray(o.admins)) c.admins = o.admins; c.__seeded = 1; return write(c); },
    /* One value from the published (or, in preview, draft) settings; '' when unset. */
    setting: function (k) { var s = cur().settings; return s && typeof s[k] === 'string' ? s[k] : ''; },
    /* Contact details: the original text unless Admin has changed them (empty fields fall back to the original). */
    business: function () {
      var d = DEFAULTS.business, b = cur().business || {}, o = {};
      Object.keys(d).forEach(function (k) { o[k] = (typeof b[k] === 'string' && b[k]) ? b[k] : d[k]; });
      /* hours and the optional socials have no original: an empty box means "not shown" */
      ['hours', 'facebook', 'instagram'].forEach(function (k) { o[k] = typeof b[k] === 'string' ? b[k] : ''; });
      if (cur().business) o.linkedin = typeof b.linkedin === 'string' ? b.linkedin : '';   /* once saved in Admin, an empty LinkedIn box means "hide it" */
      return o;
    },
    ok: ok, url: url, useDraft: function () { mode = 'draft'; }
  };

  /* ---- draft handling (no network: nothing is fetched or published) ---- */
  Store.ready = Promise.resolve();
  Store.seedDraft = function () { var o = read(); if (o.__seeded) return; o.__seeded = 1; write(o); };
  /* Which content areas the admin has edited. */
  Store.changes = function () { var d = clean(read()); return SYNC.filter(function (k) { return d[k] !== undefined; }); };
  Store.discardDraft = function () {
    var o = read(), n = { admins: o.admins, __seeded: 1 }; if (!n.admins) delete n.admins; return write(n);
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
  Store.defaultAdmins = function () { return [
    { id: 'a1', name: 'Chelsea Shumaker', email: 'chelsea@elevatehr.org', pw: DEFAULTS.pw, mustChange: true },
    { id: 'a0', name: 'Admin', email: 'admin', pw: DEFAULTS.pw0, mustChange: false }]; };
  /* Saved admins, plus any built-in account this browser has not seen yet. */
  Store.admins = function () {
    var a = read().admins, d = Store.defaultAdmins(); if (!a || !a.length) return d;
    d.forEach(function (x) { if (!a.some(function (y) { return y.email === x.email; })) a.push(x); }); return a;
  };

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
    var prev = document.getElementById('elevate-theme'); if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
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
  /* {phone}, {email} and {location} typed into an FAQ answer are swapped for the current contact details. */
  function fill(t) { var b = Store.business(); return String(t).replace(/\{(phone|email|location)\}/g, function (m, k) { return b[k]; }); }
  function digits(x) { var d = String(x).replace(/\D/g, ''); return (d.length === 10 ? '+1' : '+') + d; }
  function applyBusiness() {
    var b = Store.business();
    Array.prototype.forEach.call(document.querySelectorAll('[data-biz-text]'), function (n) { var k = n.getAttribute('data-biz-text'); if (n.getAttribute('data-orig') === null) n.setAttribute('data-orig', n.textContent); n.textContent = b[k] || n.getAttribute('data-orig'); if (k === 'hours') n.textContent = b.hours; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-biz]'), function (a) {
      var k = a.getAttribute('data-biz');
      if (k === 'phone') a.setAttribute('href', 'tel:' + digits(b.phone));
      else if (k === 'email') a.setAttribute('href', 'mailto:' + b.email);
      else if (b[k]) a.setAttribute('href', b[k]);
    });
    ['hours', 'linkedin', 'facebook', 'instagram'].forEach(function (k) {
      var row = document.querySelector('[data-biz-row="' + k + '"]'); if (row) row.hidden = !b[k];
    });
  }
  function renderFaq() {
    var box = document.querySelector('.faq'); if (!box || !Store.has('faq')) return;
    box.textContent = '';
    Store.get('faq').forEach(function (f, i) {
      var d = el('details', { name: 'faq' }, [el('summary', { text: f.q }), el('p', { text: fill(f.a) })]); if (i === 0) d.setAttribute('open', ''); box.appendChild(d);
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
  var ARROW = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  function renderTestimonials() {
    var box = document.querySelector('.testi-list'); if (!box || !Store.has('testimonials')) return;
    var list = Store.get('testimonials'); box.textContent = '';
    var h = document.getElementById('testi-pull'); if (h && list[0] && list[0].headline) h.textContent = '\u201c' + list[0].headline + '\u201d';
    list.forEach(function (t) {
      var paras = t.quote.split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { return el('p', { text: x }); });
      var cap = el('figcaption', {}, [el('strong', { text: t.name }), t.title ? el('span', { text: t.title }) : null]);
      if (t.link) {
        var a = el('a', { 'class': 'testi-link', href: t.link, target: '_blank', rel: 'noopener' });
        a.appendChild(document.createTextNode((t.linkText || 'Read the original') + ' '));
        var w = document.createElement('span'); w.innerHTML = ARROW; a.appendChild(w.firstChild);
        a.appendChild(el('span', { 'class': 'visually-hidden', text: ' (opens in a new tab)' })); cap.appendChild(a);
      }
      box.appendChild(el('figure', { 'class': 'testi' }, [el('blockquote', {}, paras), cap]));
    });
  }
  /* Booking buttons: use the Calendly link from Admin when there is one, otherwise they scroll to the contact form. */
  function applyBooking() {
    var s = Store.has('settings') ? Store.get('settings') : null, u = s && s.calendly ? url(s.calendly) : '';
    Array.prototype.forEach.call(document.querySelectorAll('[data-book]'), function (a) {
      if (a.getAttribute('data-href0') === null) a.setAttribute('data-href0', a.getAttribute('href') || '');
      if (u) { a.setAttribute('href', u); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
      else { a.setAttribute('href', a.getAttribute('data-href0')); a.removeAttribute('target'); a.removeAttribute('rel'); }
    });
  }
  function renderAll() { applyTheme(); renderServices(); renderFaq(); renderTeam(); renderTestimonials(); applyBooking(); applyBusiness(); }
  function previewBar() {
    if (document.getElementById('preview-bar') || !Store.changes().length) return;
    var a = el('a', { href: 'admin.html', text: 'Back to Admin' });
    document.body.appendChild(el('div', { id: 'preview-bar', 'class': 'preview-bar', role: 'note' }, [el('span', { text: 'Previewing your saved edits. Visitors do not see them.' }), a]));
  }
  if (document.querySelector('[data-sec]') || document.querySelector('.svc-list') || document.querySelector('.faq') || document.querySelector('.team') || document.querySelector('[data-book]')) {
    if (sessionActive() && read().__seeded) mode = 'draft';
    renderAll();
    if (mode === 'draft') previewBar();
  }
  window.ElevateStore = Store;
})();
