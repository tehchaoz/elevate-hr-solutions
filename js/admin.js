/* Elevate HR Solutions: admin screen. Saves a draft in this browser; Publish commits content.json to the repo. Needs js/store.js. */
(function () {
  'use strict';
  var S = window.ElevateStore, el = S.el;
  S.useDraft();
  var NAMES = { theme: 'Colors', services: 'Services', faq: 'FAQ', team: 'Team', testimonials: 'Testimonials', settings: 'Calendly / entries settings' };
  var note = { text: '', bad: false };
  function $(s, r) { return (r || document).querySelector(s); }
  var SESS = 'elevate.sess', LOCK = 'elevate.lock', TTL = 30 * 60 * 1000;
  var me = null, tab = 'colors', statusT;

  /* ---------- session + throttle ---------- */
  function getSess() { try { var s = JSON.parse(sessionStorage.getItem(SESS)); return s && s.exp > Date.now() ? s : null; } catch (e) { return null; } }
  function setSess(email) { var exp = Date.now() + TTL; try { sessionStorage.setItem(SESS, JSON.stringify({ email: email, exp: exp })); localStorage.setItem('elevate.prev', String(exp)); } catch (e) {} }
  function touch() { var s = getSess(); if (s) setSess(s.email); }
  function lockState() { try { return JSON.parse(localStorage.getItem(LOCK)) || { n: 0, until: 0 }; } catch (e) { return { n: 0, until: 0 }; } }
  function setLock(o) { try { localStorage.setItem(LOCK, JSON.stringify(o)); } catch (e) {} }
  function say(msg, bad) { var s = $('#status'); s.textContent = msg; s.className = 'a-status' + (bad ? ' bad' : ''); clearTimeout(statusT); statusT = setTimeout(function () { s.textContent = ''; }, 5000); pubBar(); }
  function goPublish() { tab = 'publish'; renderTabs(); renderPanel(); }
  /* The banner shown on every tab while there are saved changes that visitors cannot see yet. */
  function pubBar() {
    var b = $('#pubbar'); if (!b) return; var ch = S.changes(); b.textContent = '';
    if (!ch.length || !me) { b.hidden = true; return; }
    b.hidden = false;
    b.appendChild(el('span', { text: 'Not live yet: ' + ch.map(function (k) { return NAMES[k]; }).join(', ') + ' changed. Visitors still see the old version.' }));
    if (tab !== 'publish') b.appendChild(btn('Go to Publish', goPublish, 'a-btn'));
  }
  function setNote(text, bad) { note.text = text; note.bad = !!bad; var m = $('#pub-msg'); if (m) { m.textContent = text; m.className = 'a-msg' + (bad ? '' : ' ok'); } }

  /* ---------- password rules ---------- */
  function pwProblem(pw, user) {
    if (pw.length < 10) return 'Use at least 10 characters.';
    if (!/[a-z]/i.test(pw) || !/[0-9]/.test(pw)) return 'Include letters and at least one number.';
    if (/welcome2026/i.test(pw)) return 'Choose something other than the starting password.';
    if (user && user.email && pw.toLowerCase().indexOf(user.email.split('@')[0].toLowerCase()) !== -1) return 'Do not use your email name in your password.';
    return '';
  }

  /* ---------- helpers ---------- */
  function field(label, input, id, hint) {
    input.id = id; return el('div', { 'class': 'a-field' }, [el('label', { 'for': id, text: label }), input, hint ? el('p', { 'class': 'a-fine', text: hint }) : null]);
  }
  function btn(text, fn, cls) { var b = el('button', { type: 'button', 'class': cls || 'a-btn', text: text }); b.addEventListener('click', fn); return b; }
  function input(type, val, attrs) { var i = el('input', Object.assign({ type: type }, attrs || {})); i.value = val || ''; return i; }
  function move(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  function swatchPicker(group, current, onPick) {
    var wrap = el('div', { 'class': 'swatches', role: 'group', 'aria-label': group });
    S.PALETTE.forEach(function (p) {
      var b = el('button', { type: 'button', 'class': 'swatch', title: p.name, 'aria-label': p.name + ' ' + p.hex, 'aria-pressed': String(current.toLowerCase() === p.hex) });
      b.style.background = p.hex;
      b.addEventListener('click', function () { onPick(p.hex); });
      wrap.appendChild(b);
    });
    var c = input('color', current, { 'aria-label': group + ' custom color', 'class': 'swatch-custom' });
    c.addEventListener('input', function () { onPick(c.value, true); });
    wrap.appendChild(c); return wrap;
  }

  /* ---------- tabs ---------- */
  var TABS = [['colors', 'Colors'], ['services', 'Services'], ['faq', 'FAQ'], ['team', 'Team'], ['testimonials', 'Testimonials'], ['calendly', 'Calendly'], ['entries', 'Intro call entries'], ['publish', 'Publish'], ['admins', 'Admins'], ['account', 'Account']];
  function renderTabs() {
    var nav = $('#tabs'); nav.textContent = '';
    TABS.forEach(function (t) {
      var b = el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === t[0]), 'class': 'a-tab', text: t[1] });
      b.addEventListener('click', function () { tab = t[0]; renderTabs(); renderPanel(); });
      nav.appendChild(b);
    });
  }
  function renderPanel() {
    var p = $('#panel'); p.textContent = ''; touch();
    ({ colors: colorsPanel, services: servicesPanel, faq: faqPanel, team: teamPanel, testimonials: testimonialsPanel, calendly: calendlyPanel, entries: entriesPanel, publish: publishPanel, admins: adminsPanel, account: accountPanel })[tab](p);
    pubBar();
  }
  function head(p, title, text) { p.appendChild(el('h2', { text: title })); if (text) p.appendChild(el('p', { 'class': 'a-lede', text: text })); }

  /* ---------- COLORS ---------- */
  function colorsPanel(p) {
    head(p, 'Colors', 'Pick a background and text color for each section. Cards inside a section (for example the white service cards) keep their own colors.');
    var theme = S.has('theme') ? S.get('theme') : {};
    S.SECTIONS.forEach(function (s) {
      var cur = theme[s.key] || {};
      var bg = cur.bg || s.bg, tx = cur.text || s.text;
      var card = el('section', { 'class': 'sec-card' });
      var prev = el('div', { 'class': 'sec-preview', 'aria-hidden': 'true' }, [el('strong', { text: 'Aa' }), el('span', { text: 'Sample text' })]);
      function paint() { prev.style.background = bg; prev.style.color = tx; }
      paint();
      function set(k, v, live) { var t = theme[s.key] || (theme[s.key] = {}); t[k] = v; if (k === 'bg') bg = v; else tx = v; paint(); if (!live) refresh(); }
      var gB = el('div', { 'class': 'sec-group' }, []), gT = el('div', { 'class': 'sec-group' }, []);
      function refresh() {
        gB.textContent = ''; gT.textContent = '';
        gB.appendChild(el('span', { 'class': 'sec-lab', text: 'Background' })); gB.appendChild(swatchPicker(s.label + ' background', bg, function (v, live) { set('bg', v, live); }));
        gT.appendChild(el('span', { 'class': 'sec-lab', text: 'Text' })); gT.appendChild(swatchPicker(s.label + ' text', tx, function (v, live) { set('text', v, live); }));
      }
      refresh();
      var resetB = btn('Reset', function () { delete theme[s.key]; bg = s.bg; tx = s.text; paint(); refresh(); say(s.label + ' set back to the original colors (press Save to keep).'); }, 'a-btn a-btn-quiet');
      card.appendChild(el('div', { 'class': 'sec-head' }, [el('div', {}, [el('h3', { text: s.label }), el('p', { 'class': 'a-fine', text: s.page + ' page · ' + s.note })]), prev]));
      card.appendChild(gB); card.appendChild(gT); card.appendChild(resetB); p.appendChild(card);
    });
    p.appendChild(el('div', { 'class': 'a-actions' }, [btn('Save colors', function () {
      var clean = {}; Object.keys(theme).forEach(function (k) { var c = theme[k]; if (c && ((c.bg && S.ok(c.bg)) || (c.text && S.ok(c.text)))) clean[k] = c; });
      if (Object.keys(clean).length) S.set('theme', clean); else S.reset('theme');
      say('Colors saved as a draft. Press Publish to put them on the live site.');
    }, 'btn btn-primary'), btn('Reset all colors', function () { if (confirm('Set every section back to its original colors?')) { S.reset('theme'); renderPanel(); say('All colors reset.'); } }, 'a-btn a-btn-quiet')]));
  }

  /* ---------- SERVICES ---------- */
  function servicesPanel(p) {
    head(p, 'Services', 'The "areas of support" list on the home page. Put one bullet per line.');
    var list = S.get('services'); var box = el('div', { 'class': 'rows' }); p.appendChild(box);
    function draw() {
      box.textContent = '';
      list.forEach(function (s, i) {
        var t = input('text', s.title, { maxlength: '90' }), ta = el('textarea', { rows: '5', maxlength: '1500' }); ta.value = (s.items || []).join('\n');
        t.addEventListener('input', function () { s.title = t.value; }); ta.addEventListener('input', function () { s.items = ta.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); });
        box.appendChild(el('div', { 'class': 'row-card' }, [
          field('Service name', t, 'sv-t' + i), field('Bullets (one per line)', ta, 'sv-b' + i),
          el('div', { 'class': 'row-actions' }, [btn('Move up', function () { move(list, i, -1); draw(); }, 'a-btn a-btn-quiet'), btn('Move down', function () { move(list, i, 1); draw(); }, 'a-btn a-btn-quiet'), btn('Remove', function () { if (confirm('Remove "' + (s.title || 'this service') + '"?')) { list.splice(i, 1); draw(); } }, 'a-btn a-btn-danger')])
        ]));
      });
    }
    draw();
    p.appendChild(el('div', { 'class': 'a-actions' }, [
      btn('Add a service', function () { list.push({ id: 's' + Date.now(), title: '', items: [] }); draw(); }, 'a-btn'),
      btn('Save services', function () { var ok = list.filter(function (s) { return s.title.trim(); }); if (!ok.length) { say('Keep at least one service.', true); return; } S.set('services', ok); say('Services saved as a draft. Press Publish to put them on the live site.'); }, 'btn btn-primary'),
      btn('Restore original', function () { if (confirm('Restore the original services list?')) { S.reset('services'); renderPanel(); } }, 'a-btn a-btn-quiet')]));
  }

  /* ---------- FAQ ---------- */
  function faqPanel(p) {
    head(p, 'FAQ', 'Questions and answers shown near the bottom of the home page.');
    var list = S.get('faq'); var box = el('div', { 'class': 'rows' }); p.appendChild(box);
    function draw() {
      box.textContent = '';
      list.forEach(function (f, i) {
        var q = input('text', f.q, { maxlength: '160' }), a = el('textarea', { rows: '4', maxlength: '1200' }); a.value = f.a;
        q.addEventListener('input', function () { f.q = q.value; }); a.addEventListener('input', function () { f.a = a.value; });
        box.appendChild(el('div', { 'class': 'row-card' }, [field('Question', q, 'fq' + i), field('Answer', a, 'fa' + i),
          el('div', { 'class': 'row-actions' }, [btn('Move up', function () { move(list, i, -1); draw(); }, 'a-btn a-btn-quiet'), btn('Move down', function () { move(list, i, 1); draw(); }, 'a-btn a-btn-quiet'), btn('Remove', function () { if (confirm('Remove this question?')) { list.splice(i, 1); draw(); } }, 'a-btn a-btn-danger')])]));
      });
    }
    draw();
    p.appendChild(el('div', { 'class': 'a-actions' }, [
      btn('Add a question', function () { list.push({ q: '', a: '' }); draw(); }, 'a-btn'),
      btn('Save FAQ', function () { var ok = list.filter(function (f) { return f.q.trim() && f.a.trim(); }); S.set('faq', ok); say('FAQ saved as a draft. Press Publish to put it on the live site.'); }, 'btn btn-primary'),
      btn('Restore original', function () { if (confirm('Restore the original FAQ?')) { S.reset('faq'); renderPanel(); } }, 'a-btn a-btn-quiet')]));
  }

  /* ---------- TEAM ---------- */
  function resizePhoto(file, cb) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) { say('Choose a JPG, PNG or WebP photo under 8 MB.', true); return; }
    var r = new FileReader();
    r.onload = function () {
      var im = new Image();
      im.onload = function () {
        var n = 360, c = document.createElement('canvas'); c.width = c.height = n; var x = c.getContext('2d');
        var s = Math.min(im.width, im.height), sx = (im.width - s) / 2, sy = Math.max(0, (im.height - s) / 2 - s * 0.08);
        x.drawImage(im, sx, sy, s, s, 0, 0, n, n); cb(c.toDataURL('image/jpeg', 0.85));
      };
      im.onerror = function () { say('That image could not be read.', true); };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function teamPanel(p) {
    head(p, 'Team', 'People shown on the About page. The owner stays first. Photos are cropped to a square.');
    var list = S.get('team'); var box = el('div', { 'class': 'rows' }); p.appendChild(box);
    function draw() {
      box.textContent = '';
      list.forEach(function (m, i) {
        var n = input('text', m.name, { maxlength: '80' }), r = input('text', m.role, { maxlength: '90' }), b = el('textarea', { rows: '5', maxlength: '1500' }); b.value = m.bio || '';
        n.addEventListener('input', function () { m.name = n.value; }); r.addEventListener('input', function () { m.role = r.value; }); b.addEventListener('input', function () { m.bio = b.value; });
        var img = el('img', { alt: '', 'class': 'thumb', width: '72', height: '72' }); if (/^(assets\/|data:image\/)/.test(m.photo || '')) img.setAttribute('src', m.photo);
        var file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', 'aria-label': 'Photo for ' + (m.name || 'team member') });
        file.addEventListener('change', function () { if (file.files[0]) resizePhoto(file.files[0], function (d) { m.photo = d; draw(); }); });
        var actions = [];
        if (i > 1) actions.push(btn('Move up', function () { move(list, i, -1); draw(); }, 'a-btn a-btn-quiet'));
        if (i > 0 && i < list.length - 1) actions.push(btn('Move down', function () { move(list, i, 1); draw(); }, 'a-btn a-btn-quiet'));
        if (i > 0) actions.push(btn('Remove', function () { if (confirm('Remove ' + (m.name || 'this team member') + '?')) { list.splice(i, 1); draw(); } }, 'a-btn a-btn-danger'));
        box.appendChild(el('div', { 'class': 'row-card' }, [
          el('div', { 'class': 'photo-row' }, [img, field(i === 0 ? 'Photo (owner)' : 'Photo', file, 'tp' + i)]),
          field('Name', n, 'tn' + i), field('Title', r, 'tr' + i), field('Short bio', b, 'tb' + i), el('div', { 'class': 'row-actions' }, actions)]));
      });
    }
    draw();
    p.appendChild(el('div', { 'class': 'a-actions' }, [
      btn('Add a team member', function () { list.push({ id: 'm' + Date.now(), name: '', role: '', bio: '', photo: '' }); draw(); }, 'a-btn'),
      btn('Save team', function () { var ok = list.filter(function (m, i) { return i === 0 || m.name.trim(); }); try { if (!S.set('team', ok)) throw 0; say('Team saved as a draft. Press Publish to put it on the live site.'); } catch (e) { say('Could not save: the photos may be too large for this browser. Remove a photo and try again.', true); } }, 'btn btn-primary'),
      btn('Restore original', function () { if (confirm('Restore the original team (owner only)?')) { S.reset('team'); renderPanel(); } }, 'a-btn a-btn-quiet')]));
  }

  /* ---------- TESTIMONIALS ---------- */
  function testimonialsPanel(p) {
    head(p, 'Testimonials', 'Client quotes shown in the testimonial section of the home page. Each one can link to the original (for example the LinkedIn recommendation) so visitors can check it is real.');
    var list = S.get('testimonials'); var box = el('div', { 'class': 'rows' }); p.appendChild(box);
    var msg = el('p', { 'class': 'a-msg', role: 'alert' });
    function draw() {
      box.textContent = '';
      list.forEach(function (t, i) {
        var hl = input('text', t.headline, { maxlength: '200' }), q = el('textarea', { rows: '9', maxlength: '4000' }); q.value = t.quote || '';
        var nm = input('text', t.name, { maxlength: '80' }), ti = input('text', t.title, { maxlength: '120' });
        var lk = input('url', t.link, { maxlength: '480', placeholder: 'https://www.linkedin.com/posts/...', inputmode: 'url', autocomplete: 'off' }), lt = input('text', t.linkText, { maxlength: '120', placeholder: 'View the original on LinkedIn' });
        hl.addEventListener('input', function () { t.headline = hl.value; }); q.addEventListener('input', function () { t.quote = q.value; });
        nm.addEventListener('input', function () { t.name = nm.value; }); ti.addEventListener('input', function () { t.title = ti.value; });
        lk.addEventListener('input', function () { t.link = lk.value; }); lt.addEventListener('input', function () { t.linkText = lt.value; });
        box.appendChild(el('div', { 'class': 'row-card' }, [
          field('Large quote (one short sentence)', hl, 'tq-h' + i, i === 0 ? 'The first testimonial\'s large quote is the headline shown beside the section.' : 'Only the first testimonial\'s large quote is shown as the headline.'),
          field('Full testimonial', q, 'tq-q' + i, 'Leave a blank line between paragraphs.'),
          field('Name', nm, 'tq-n' + i), field('Title and company', ti, 'tq-t' + i),
          field('Link to the original (optional)', lk, 'tq-l' + i, 'Must start with https://. When filled in, the whole card opens this page.'),
          field('Link wording', lt, 'tq-lt' + i, 'For example: View the original on LinkedIn, August 7, 2026'),
          el('div', { 'class': 'row-actions' }, [btn('Move up', function () { move(list, i, -1); draw(); }, 'a-btn a-btn-quiet'), btn('Move down', function () { move(list, i, 1); draw(); }, 'a-btn a-btn-quiet'), btn('Remove', function () { if (confirm('Remove the testimonial from ' + (t.name || 'this person') + '?')) { list.splice(i, 1); draw(); } }, 'a-btn a-btn-danger')])]));
      });
    }
    draw();
    p.appendChild(msg);
    p.appendChild(el('div', { 'class': 'a-actions' }, [
      btn('Add a testimonial', function () { list.push({ id: 't' + Date.now(), headline: '', quote: '', name: '', title: '', link: '', linkText: '' }); draw(); }, 'a-btn'),
      btn('Save testimonials', function () {
        msg.textContent = '';
        for (var i = 0; i < list.length; i++) {
          var t = list[i];
          if (!t.name.trim() || !t.quote.trim()) { msg.textContent = 'Testimonial ' + (i + 1) + ' needs a name and the full testimonial text.'; return; }
          if (t.link.trim() && !S.url(t.link)) { msg.textContent = 'The link for ' + t.name + ' must be a full web address starting with https://'; return; }
        }
        if (!list.length) { msg.textContent = 'Keep at least one testimonial, or use "Restore original".'; return; }
        S.set('testimonials', list.map(function (t) { return { id: t.id, headline: t.headline.trim(), quote: t.quote.trim(), name: t.name.trim(), title: t.title.trim(), link: S.url(t.link), linkText: t.linkText.trim() }; }));
        say('Testimonials saved as a draft. Press Publish to put them on the live site.');
      }, 'btn btn-primary'),
      btn('Restore original', function () { if (confirm('Restore the original testimonial?')) { S.reset('testimonials'); renderPanel(); } }, 'a-btn a-btn-quiet')]));
  }

  /* ---------- CALENDLY ---------- */
  function getSettings() { return Object.assign({}, S.get('settings') || {}); }
  function putSettings(o) {
    var out = {}; Object.keys(o).forEach(function (k) { if (o[k]) out[k] = o[k]; });
    if (Object.keys(out).length) S.set('settings', out); else S.reset('settings');
  }
  function calendlyPanel(p) {
    head(p, 'Calendly', 'The "Book intro call" buttons on every page open this link. Until a link is added, those buttons scroll to the contact form instead, so nothing is broken while the Calendly account is inactive.');
    var cur = (S.get('settings') || {}).calendly || '';
    var u = input('url', cur, { maxlength: '480', placeholder: 'https://calendly.com/your-name/intro-call', inputmode: 'url', autocomplete: 'off', 'aria-describedby': 'cal-msg' });
    var msg = el('p', { 'class': 'a-msg', role: 'alert', id: 'cal-msg' });
    p.appendChild(el('div', { 'class': 'add-form' }, [field('Calendly scheduling link', u, 'cal-u', 'Copy it from your Calendly account (Share, then Copy link). Leave empty to switch booking off.'), msg,
      el('div', { 'class': 'a-actions' }, [
        btn('Save link', function () {
          var v = u.value.trim(); msg.textContent = '';
          if (v && !S.url(v)) { msg.textContent = 'Enter the full link, starting with https://'; return; }
          var st = getSettings(); st.calendly = v ? S.url(v) : ''; putSettings(st);
          say(v ? 'Calendly link saved as a draft. Press Publish to put it on the live site.' : 'Calendly link cleared. Press Publish to apply it.');
        }, 'btn btn-primary'),
        btn('Test the link', function () { var v = S.url(u.value); if (!v) { msg.textContent = 'Enter a full https:// link first.'; return; } window.open(v, '_blank', 'noopener'); }, 'a-btn')])]));
  }

  /* ---------- INTRO CALL ENTRIES (backup until Calendly is set up) ---------- */
  function entriesPanel(p) {
    head(p, 'Intro call entries', 'Requests from the contact form on the home page. A free form service receives each one, emails it to Chelsea and keeps a list you can open any time. Use it as the backup until Calendly is set up.');
    var st = getSettings(), on = !!S.url(st.formEndpoint || '');
    p.appendChild(el('div', { 'class': 'pub-status' }, [
      el('strong', { text: on ? 'Form service is connected' : 'Not connected yet' }),
      el('p', { 'class': 'a-fine', text: on ? 'Requests are sent to the service, which emails them and keeps them.' : 'Until a link is added, the form opens the visitor\'s email app addressed to chelsea@elevatehr.org. Nothing is stored.' })]));
    p.appendChild(el('details', { 'class': 'pub-help' }, [el('summary', { text: 'How to set it up (one time, about five minutes)' }), el('ol', {}, [
      el('li', { text: 'Create a free account at formspree.io using the email where requests should arrive (chelsea@elevatehr.org).' }),
      el('li', { text: 'Choose New form, name it "Intro call requests", and confirm the email address.' }),
      el('li', { text: 'Copy the form link. It looks like https://formspree.io/f/abcdwxyz. Paste it below.' }),
      el('li', { text: 'Copy the page address of the form\'s Submissions list as well, and paste it into the second box so the Open entries button works.' }),
      el('li', { text: 'Press Save, then Publish, then Send a test entry to check it arrives.' })])]));
    var ep = input('url', st.formEndpoint || '', { maxlength: '480', placeholder: 'https://formspree.io/f/...', inputmode: 'url', autocomplete: 'off' });
    var en = input('url', st.entriesUrl || '', { maxlength: '480', placeholder: 'https://formspree.io/forms/.../submissions', inputmode: 'url', autocomplete: 'off' });
    var msg = el('p', { 'class': 'a-msg', role: 'alert' });
    p.appendChild(el('div', { 'class': 'add-form' }, [
      field('Form link (where requests are sent)', ep, 'en-ep', 'Leave empty to go back to the email-app fallback.'),
      field('Entries page (optional)', en, 'en-en', 'Where you read the list. Needs your account login.'), msg,
      el('div', { 'class': 'a-actions' }, [
        btn('Save', function () {
          msg.textContent = '';
          if (ep.value.trim() && !S.url(ep.value)) { msg.textContent = 'The form link must start with https://'; return; }
          if (en.value.trim() && !S.url(en.value)) { msg.textContent = 'The entries page must start with https://'; return; }
          var n = getSettings(); n.formEndpoint = S.url(ep.value); n.entriesUrl = S.url(en.value); putSettings(n);
          say('Saved as a draft. Press Publish to turn it on for the live site.'); renderPanel();
        }, 'btn btn-primary'),
        btn('Send a test entry', function () {
          var u = S.url(ep.value); if (!u) { msg.textContent = 'Enter a full https:// form link first.'; return; }
          msg.className = 'a-msg ok'; msg.textContent = 'Sending…';
          fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ name: 'Test entry from Admin', email: me.email, company: 'Elevate admin', message: 'This is a test sent from the Admin screen. You can ignore it.', _subject: 'Test: intro call request', source: 'Admin test' }) })
            .then(function (r) { if (!r.ok) throw new Error(); msg.className = 'a-msg ok'; msg.textContent = 'Test sent. Check the inbox and the entries page. If this is a new form, the service may ask you to confirm it first.'; })
            .catch(function () { msg.className = 'a-msg'; msg.textContent = 'The test did not go through. Check the form link.'; });
        }, 'a-btn')].concat(S.url(en.value || st.entriesUrl || '') ? [btn('Open entries', function () { var v = S.url(en.value); if (v) window.open(v, '_blank', 'noopener'); }, 'a-btn')] : []))]));
    p.appendChild(el('p', { 'class': 'a-fine', text: 'Entries are kept by the form service, not by this website. Free plans have a monthly limit, so check the service\'s plan page. Calendly bookings are listed in Calendly itself.' }));
  }

  /* ---------- PUBLISH ---------- */
  function pollLive(stamp, n) {
    S.fetchLive(true).then(function (raw) {
      if (raw && raw.updated === stamp) { setNote('Live now. Visitors can see your changes (they may need to refresh the page).'); return; }
      if ((n || 0) >= 30) { setNote('Published. The live site is still updating; check the live page again in a few minutes.'); return; }
      setTimeout(function () { pollLive(stamp, (n || 0) + 1); }, 6000);
    });
  }
  function publishPanel(p) {
    head(p, 'Publish', 'Saving keeps your changes as a draft in this browser. Publishing sends them to the live site so every visitor sees them.');
    var ch = S.changes(), tok = S.token();
    p.appendChild(el('div', { 'class': 'pub-status' }, [
      el('strong', { text: ch.length ? 'Ready to publish' : 'Nothing to publish' }),
      el('p', { 'class': 'a-fine', text: ch.length ? 'Changed since the live site: ' + ch.map(function (k) { return NAMES[k]; }).join(', ') + '.' : 'The live site already matches your saved changes.' })]));

    p.appendChild(el('h3', { text: 'Publishing key' }));
    if (tok) {
      p.appendChild(el('p', { 'class': 'a-fine', text: 'A publishing key is saved in this browser (ends in ' + tok.slice(-4) + '). Anyone using this browser while logged in can publish.' }));
      p.appendChild(el('div', { 'class': 'a-actions' }, [btn('Remove key from this browser', function () { S.clearToken(); setNote(''); renderPanel(); say('Key removed.'); }, 'a-btn a-btn-quiet')]));
    } else {
      p.appendChild(el('p', { 'class': 'a-fine', text: 'Publishing needs a publishing key. Your web developer creates it once and gives it to you. It is what really protects the live site: without it nobody can publish, whatever password they know. Treat it like a password.' }));
      var k = input('password', '', { autocomplete: 'off', spellcheck: 'false', 'aria-describedby': 'k-msg' }), rem = el('input', { type: 'checkbox', id: 'k-rem' });
      var kmsg = el('p', { 'class': 'a-msg', role: 'alert', id: 'k-msg' });
      p.appendChild(el('div', { 'class': 'add-form' }, [field('Publishing key', k, 'k-in'),
        el('label', { 'class': 'a-check', 'for': 'k-rem' }, [rem, el('span', { text: 'Remember on this computer (only on a computer you trust)' })]), kmsg,
        btn('Save key', function () {
          var v = k.value.trim(); kmsg.textContent = ''; kmsg.className = 'a-msg';
          if (v.length < 20) { kmsg.textContent = 'Paste the whole publishing key.'; return; }
          kmsg.textContent = 'Checking…';
          S.checkToken(v).then(function () { S.saveToken(v, rem.checked); renderPanel(); say('Key saved.'); }).catch(function (e) { kmsg.textContent = e.message || 'Could not check the key. Are you online?'; });
        }, 'btn btn-primary')]));
    }

    p.appendChild(el('h3', { text: 'Publish' }));
    var msg = el('p', { 'class': 'a-msg' + (note.bad || !note.text ? '' : ' ok'), id: 'pub-msg', role: 'status', 'aria-live': 'polite', text: note.text });
    var go = btn('Publish to live site', function () {
      if (!confirm('Publish ' + ch.map(function (k) { return NAMES[k]; }).join(', ') + ' to the live site? Every visitor will see it.')) return;
      go.disabled = true; setNote('Publishing…');
      S.publish(S.token(), me.email, function () { return confirm('The live site was changed by someone else after you opened Admin. Publishing now replaces their changes. Continue?'); })
        .then(function (payload) { setNote('Published. The live site is updating, which takes about a minute. Checking…'); renderPanel(); pollLive(payload.updated); })
        .catch(function (e) {
          if (e && e.cancelled) setNote('Cancelled. Nothing was changed.'); else if (e && e.status === 401) { S.clearToken(); setNote(e.message + ' It was removed; add a new one.', true); }
          else setNote((e && e.message) || 'Could not publish. Check your connection and try again.', true);
          renderPanel();
        });
    }, 'btn btn-primary');
    go.disabled = !ch.length || !tok;
    var acts = [go];
    if (ch.length) acts.push(btn('Discard unpublished changes', function () { if (confirm('Throw away your saved draft and go back to what is live?')) { S.discardDraft(); setNote(''); renderPanel(); say('Draft discarded.'); } }, 'a-btn a-btn-quiet'));
    p.appendChild(el('div', { 'class': 'a-actions' }, acts)); p.appendChild(msg);
    if (!tok) p.appendChild(el('p', { 'class': 'a-fine', text: 'Add the publishing key above to turn on the Publish button.' }));
    p.appendChild(el('p', { 'class': 'a-fine', text: 'Every publish is saved as a version, so an earlier version can always be brought back. Admin accounts and passwords stay in this browser and are never published.' }));
  }

  /* ---------- ADMINS ---------- */
  function adminsPanel(p) {
    head(p, 'Admins', 'People who can log in here. A new admin gets a temporary password and must choose their own at first log in.');
    var list = S.admins();
    var ul = el('ul', { 'class': 'admin-list' });
    list.forEach(function (a) {
      var li = el('li', {}, [el('span', {}, [el('strong', { text: a.name }), el('span', { 'class': 'a-fine', text: ' ' + a.email + (a.email === me.email ? ' (you)' : '') + (a.mustChange ? ' · has not chosen a password yet' : '') })])]);
      if (a.email !== me.email) li.appendChild(btn('Remove', function () { if (confirm('Remove ' + a.name + ' as an admin?')) { S.set('admins', list.filter(function (x) { return x.email !== a.email; })); renderPanel(); say('Admin removed.'); } }, 'a-btn a-btn-danger'));
      ul.appendChild(li);
    });
    p.appendChild(ul);
    p.appendChild(el('h3', { text: 'Add an admin' }));
    var n = input('text', '', { maxlength: '80', autocomplete: 'off' }), e = input('email', '', { maxlength: '120', autocomplete: 'off' }), t = input('password', '', { autocomplete: 'new-password' });
    var msg = el('p', { 'class': 'a-msg', role: 'alert' });
    var form = el('form', { novalidate: 'novalidate', 'class': 'add-form' }, [field('Name', n, 'an'), field('Email', e, 'ae'), field('Temporary password', t, 'at', 'At least 10 characters with letters and a number. Share it privately.'), msg, el('button', { 'class': 'btn btn-primary', type: 'submit', text: 'Add admin' })]);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); msg.textContent = '';
      var name = n.value.trim(), email = e.value.trim().toLowerCase();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Enter a name and a valid email.'; return; }
      if (list.some(function (a) { return a.email === email; })) { msg.textContent = 'That email is already an admin.'; return; }
      var bad = pwProblem(t.value, { email: email }); if (bad) { msg.textContent = bad; return; }
      S.hash(t.value).then(function (h) { list.push({ id: 'a' + Date.now(), name: name, email: email, pw: h, mustChange: true }); S.set('admins', list); renderPanel(); say('Admin added.'); });
    });
    p.appendChild(form);
  }

  /* ---------- ACCOUNT ---------- */
  function pwForm(form, forced, done) {
    var cur = input('password', '', { autocomplete: 'current-password' }), nw = input('password', '', { autocomplete: 'new-password' }), cf = input('password', '', { autocomplete: 'new-password' });
    var msg = el('p', { 'class': 'a-msg', role: 'alert' });
    [field('Current password', cur, forced ? 'fc' : 'ac'), field('New password', nw, forced ? 'fn' : 'an2', 'At least 10 characters with letters and a number.'), field('Confirm new password', cf, forced ? 'ff' : 'af'), msg, el('button', { 'class': 'btn btn-primary', type: 'submit', text: 'Change password' })].forEach(function (x) { form.appendChild(x); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); msg.textContent = '';
      if (nw.value !== cf.value) { msg.textContent = 'The new passwords do not match.'; return; }
      var bad = pwProblem(nw.value, me); if (bad) { msg.textContent = bad; return; }
      S.verify(cur.value, me.pw).then(function (ok) {
        if (!ok) { msg.textContent = 'Current password is not right.'; return; }
        return S.hash(nw.value).then(function (h) {
          var list = S.admins().map(function (a) { if (a.email === me.email) { a.pw = h; a.mustChange = false; me = a; } return a; });
          S.set('admins', list); say('Password changed.'); done();
        });
      });
    });
  }
  function accountPanel(p) {
    head(p, 'Account', 'Signed in as ' + me.name + ' (' + me.email + ').');
    p.appendChild(el('h3', { text: 'Change your password' }));
    var f = el('form', { novalidate: 'novalidate', 'class': 'add-form' }); pwForm(f, false, function () { f.reset(); }); p.appendChild(f);
    p.appendChild(el('h3', { text: 'Backup' }));
    p.appendChild(el('p', { 'class': 'a-fine', text: 'Download your draft and admin list to keep a copy or move them to another browser. Passwords are included only as scrambled hashes. The live site keeps its own saved versions.' }));
    var imp = el('input', { type: 'file', accept: 'application/json', 'aria-label': 'Import a backup file' });
    imp.addEventListener('change', function () {
      var f = imp.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { try { S.importAll(r.result); say('Backup restored.'); renderPanel(); } catch (e) { say('That file is not a valid backup.', true); } };
      r.readAsText(f);
    });
    p.appendChild(el('div', { 'class': 'a-actions' }, [btn('Download backup', function () {
      var a = el('a', { href: URL.createObjectURL(new Blob([S.exportAll()], { type: 'application/json' })), download: 'elevate-site-backup.json' }); document.body.appendChild(a); a.click(); a.remove();
    }, 'a-btn'), imp]));
  }

  /* ---------- login flow ---------- */
  function showApp() {
    $('#login').hidden = true; $('#app').hidden = false; $('#logout').hidden = false;
    var forced = me.mustChange;
    $('#force').hidden = !forced; $('#panels').hidden = forced;
    if (forced) { var f = $('#force-form'); f.textContent = ''; pwForm(f, true, function () { showApp(); }); $('#fc').focus(); }
    else { renderTabs(); renderPanel(); }
  }
  function logout() { try { sessionStorage.removeItem(SESS); localStorage.removeItem('elevate.prev'); } catch (e) {} me = null; location.reload(); }
  $('#logout').addEventListener('click', logout);
  var timer = setInterval(function () { if (me && !getSess()) { clearInterval(timer); logout(); } }, 15000);

  $('#login-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var msg = $('#login-msg'), email = $('#l-email').value.trim().toLowerCase(), pw = $('#l-pw').value, lk = lockState();
    msg.textContent = '';
    if (lk.until > Date.now()) { msg.textContent = 'Too many tries. Please wait ' + Math.ceil((lk.until - Date.now()) / 60000) + ' minute(s).'; return; }
    var a = S.admins().filter(function (x) { return x.email === email; })[0];
    /* always do the hash work so a wrong email and a wrong password take the same time */
    S.verify(pw, a ? a.pw : S.defaultAdmins()[0].pw).then(function (ok) {
      if (a && ok) { setLock({ n: 0, until: 0 }); me = a; setSess(a.email); $('#l-pw').value = ''; S.ready.then(function () { S.seedDraft(); showApp(); }); return; }
      lk.n = (lk.n || 0) + 1; if (lk.n >= 5) { lk.until = Date.now() + 5 * 60000; lk.n = 0; } setLock(lk);
      msg.textContent = 'Email or password is not right.';
    });
  });

  var s = getSess();
  if (s) { S.ready.then(function () { S.seedDraft(); var a0 = S.admins().filter(function (x) { return x.email === s.email; })[0]; if (a0) { me = a0; showApp(); } }); }
})();
