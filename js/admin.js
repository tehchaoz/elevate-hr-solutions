/* Elevate HR Solutions: admin screen.  Edits are saved in this browser. Needs js/store.js. */
(function () {
  'use strict';
  var S = window.ElevateStore, el = S.el;
  S.useDraft();
  function $(s, r) { return (r || document).querySelector(s); }
  var SESS = 'elevate.sess', LOCK = 'elevate.lock', TTL = 30 * 60 * 1000;
  var me = null, tab = 'colors', statusT;

  /* ---------- session + throttle ---------- */
  function getSess() { try { var s = JSON.parse(sessionStorage.getItem(SESS)); return s && s.exp > Date.now() ? s : null; } catch (e) { return null; } }
  function setSess(email) { var exp = Date.now() + TTL; try { sessionStorage.setItem(SESS, JSON.stringify({ email: email, exp: exp })); localStorage.setItem('elevate.prev', String(exp)); } catch (e) {} }
  function touch() { var s = getSess(); if (s) setSess(s.email); }
  function lockState() { try { return JSON.parse(localStorage.getItem(LOCK)) || { n: 0, until: 0 }; } catch (e) { return { n: 0, until: 0 }; } }
  function setLock(o) { try { localStorage.setItem(LOCK, JSON.stringify(o)); } catch (e) {} }
  function say(msg, bad) { var s = $('#status'); s.textContent = msg; s.className = 'a-status' + (bad ? ' bad' : ''); clearTimeout(statusT); statusT = setTimeout(function () { s.textContent = ''; }, 5000); }

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
  var TABS = [['colors', 'Colors'], ['services', 'Services'], ['faq', 'FAQ'], ['team', 'Team'], ['testimonials', 'Testimonials'], ['calendly', 'Calendly'], ['entries', 'Intro call entries'], ['account', 'Account & admins']];
  /* What each admin may edit. An admin saved without a list (the built-in ones) has full access. */
  var PERMS = [['colors', 'Colors'], ['services', 'Services'], ['faq', 'FAQ'], ['team', 'Team'], ['testimonials', 'Testimonials'], ['calendly', 'Calendly link'], ['entries', 'Intro call entries'], ['admins', 'Manage admins']];
  function allows(person, key) { return !person.perms || person.perms.indexOf(key) !== -1; }
  function can(key) { return key === 'account' || (me && allows(me, key)); }
  function isFull(person) { return !person.perms || PERMS.every(function (x) { return person.perms.indexOf(x[0]) !== -1; }); }
  function accessText(person) { return isFull(person) ? 'Full access' : (person.perms.length ? 'Can edit: ' + PERMS.filter(function (x) { return person.perms.indexOf(x[0]) !== -1; }).map(function (x) { return x[1]; }).join(', ') : 'View only'); }
  function permBoxes(selected, prefix) {
    var boxes = [], fs = el('fieldset', { 'class': 'perm-set' }, [el('legend', { text: 'What they can edit' })]);
    PERMS.forEach(function (x, i) {
      var cb = el('input', { type: 'checkbox', id: prefix + i, value: x[0] }); cb.checked = selected.indexOf(x[0]) !== -1; boxes.push(cb);
      fs.appendChild(el('label', { 'class': 'a-check', 'for': prefix + i }, [cb, el('span', { text: x[1] + (x[0] === 'admins' ? ' (add and remove admins, change what they can edit)' : '') })]));
    });
    return { node: fs, get: function () { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; }); } };
  }
  function firstAllowed() { for (var i = 0; i < TABS.length; i++) if (can(TABS[i][0])) return TABS[i][0]; return 'account'; }
  function renderTabs() {
    var nav = $('#tabs'); nav.textContent = ''; if (!can(tab)) tab = firstAllowed();
    TABS.filter(function (t) { return can(t[0]); }).forEach(function (t) {
      var b = el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === t[0]), 'class': 'a-tab', text: t[1] });
      b.addEventListener('click', function () { tab = t[0]; renderTabs(); renderPanel(); });
      nav.appendChild(b);
    });
    var sel = nav.querySelector('[aria-selected="true"]'); if (sel) nav.scrollLeft = Math.max(0, sel.offsetLeft - 16);   /* keep the chosen tab in view inside the row, without moving the page */
  }
  function renderPanel() {
    var p = $('#panel'); p.textContent = ''; touch(); if (!can(tab)) tab = firstAllowed();
    ({ colors: colorsPanel, services: servicesPanel, faq: faqPanel, team: teamPanel, testimonials: testimonialsPanel, calendly: calendlyPanel, entries: entriesPanel, account: accountPanel })[tab](p);
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
      say('Colors saved.');
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
      btn('Save services', function () { var ok = list.filter(function (s) { return s.title.trim(); }); if (!ok.length) { say('Keep at least one service.', true); return; } S.set('services', ok); say('Services saved.'); }, 'btn btn-primary'),
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
      btn('Save FAQ', function () { var ok = list.filter(function (f) { return f.q.trim() && f.a.trim(); }); S.set('faq', ok); say('FAQ saved.'); }, 'btn btn-primary'),
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
      btn('Save team', function () { var ok = list.filter(function (m, i) { return i === 0 || m.name.trim(); }); try { if (!S.set('team', ok)) throw 0; say('Team saved.'); } catch (e) { say('Could not save: the photos may be too large for this browser. Remove a photo and try again.', true); } }, 'btn btn-primary'),
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
        say('Testimonials saved.');
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
          say(v ? 'Calendly link saved.' : 'Calendly link cleared.');
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
      el('li', { text: 'Press Save, then Send a test entry to check it arrives.' })])]));
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
          say('Saved.'); renderPanel();
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

  /* ---------- ACCOUNT & ADMINS (one tab, folding sections) ---------- */
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
  function fold(summaryKids, bodyKids, open) {
    var d = el('details', { 'class': 'fold' }, [el('summary', {}, summaryKids), el('div', { 'class': 'fold-body' }, bodyKids)]); if (open) d.open = true; return d;
  }
  function chipText(person) { return isFull(person) ? 'Full access' : (person.perms.length ? person.perms.length + ' of ' + PERMS.length + ' areas' : 'View only'); }
  function userFold(a, list) {
    var you = a.email === me.email;
    var sum = [el('span', { 'class': 'u-name', text: a.name }), el('span', { 'class': 'a-fine', text: a.email + (you ? ' (you)' : '') + (a.mustChange ? ' · has not chosen a password yet' : '') }), el('span', { 'class': 'u-chip', text: chipText(a) })];
    if (you) return fold(sum, [el('p', { 'class': 'a-fine', text: 'This is you. Change your own password under "My account" above.' })]);
    var pb = permBoxes(a.perms || PERMS.map(function (x) { return x[0]; }), 'pe' + a.id + '-');
    var saveB = btn('Save access', function () { a.perms = pb.get(); S.set('admins', list); renderPanel(); say('Access updated for ' + a.name + '.'); }, 'btn btn-primary');
    var rp = input('password', '', { autocomplete: 'new-password', maxlength: '100' }), rmsg = el('p', { 'class': 'a-msg', role: 'alert' });
    var resetB = btn('Set temporary password', function () {
      rmsg.textContent = ''; var bad = pwProblem(rp.value, { email: a.email }); if (bad) { rmsg.textContent = bad; return; }
      S.hash(rp.value).then(function (h) { a.pw = h; a.mustChange = true; S.set('admins', list); renderPanel(); say('Password reset for ' + a.name + '. They must choose a new one at their next log in.'); });
    }, 'btn btn-primary');
    var rem = btn('Remove ' + a.name, function () { if (confirm('Remove ' + a.name + ' as an admin?')) { S.set('admins', list.filter(function (x) { return x.email !== a.email; })); renderPanel(); say('Admin removed.'); } }, 'a-btn a-btn-danger');
    return fold(sum, [
      el('div', { 'class': 'sub' }, [pb.node, saveB]),
      el('div', { 'class': 'sub' }, [el('h4', { text: 'Reset password' }), field('Temporary password', rp, 'rp' + a.id, 'At least 10 characters with letters and a number. Share it privately. They must choose their own at next log in.'), rmsg, resetB]),
      el('div', { 'class': 'a-actions' }, [rem])]);
  }
  function addAdminFold(list) {
    var n = input('text', '', { maxlength: '80', autocomplete: 'off' }), e = input('email', '', { maxlength: '120', autocomplete: 'off' }), t = input('password', '', { autocomplete: 'new-password' });
    var msg = el('p', { 'class': 'a-msg', role: 'alert' });
    var addPerms = permBoxes(PERMS.filter(function (x) { return x[0] !== 'admins'; }).map(function (x) { return x[0]; }), 'pn-');
    var form = el('form', { novalidate: 'novalidate', 'class': 'add-form' }, [field('Name', n, 'an'), field('Email', e, 'ae'), field('Temporary password', t, 'at', 'At least 10 characters with letters and a number. Share it privately.'), addPerms.node, msg, el('button', { 'class': 'btn btn-primary', type: 'submit', text: 'Add admin' })]);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); msg.textContent = '';
      var name = n.value.trim(), email = e.value.trim().toLowerCase();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Enter a name and a valid email.'; return; }
      if (list.some(function (x) { return x.email === email; })) { msg.textContent = 'That email is already an admin.'; return; }
      var bad = pwProblem(t.value, { email: email }); if (bad) { msg.textContent = bad; return; }
      S.hash(t.value).then(function (h) { list.push({ id: 'a' + Date.now(), name: name, email: email, pw: h, mustChange: true, perms: addPerms.get() }); S.set('admins', list); renderPanel(); say('Admin added.'); });
    });
    return fold([el('span', { 'class': 'u-name', text: 'Add an admin' })], [form]);
  }
  function accountPanel(p) {
    head(p, 'Account & admins', 'Signed in as ' + me.name + ' (' + me.email + ').');
    p.appendChild(el('h3', { text: 'My account' }));
    var f = el('form', { novalidate: 'novalidate', 'class': 'add-form' }); pwForm(f, false, function () { f.reset(); });
    var imp = el('input', { type: 'file', accept: 'application/json', 'aria-label': 'Import a backup file' });
    imp.addEventListener('change', function () {
      var fl = imp.files[0]; if (!fl) return; var r = new FileReader();
      r.onload = function () { try { S.importAll(r.result); say('Backup restored.'); renderPanel(); } catch (e) { say('That file is not a valid backup.', true); } };
      r.readAsText(fl);
    });
    p.appendChild(el('div', { 'class': 'fold-list' }, [
      fold([el('span', { 'class': 'u-name', text: 'Change my password' })], [f]),
      fold([el('span', { 'class': 'u-name', text: 'Backup and restore' })], [
        el('p', { 'class': 'a-fine', text: 'Download your saved edits and admin list to keep a copy or move them to another browser. Passwords are included only as scrambled hashes.' }),
        el('div', { 'class': 'a-actions' }, [btn('Download backup', function () {
          var a = el('a', { href: URL.createObjectURL(new Blob([S.exportAll()], { type: 'application/json' })), download: 'elevate-site-backup.json' }); document.body.appendChild(a); a.click(); a.remove();
        }, 'a-btn'), imp])])]));
    if (can('admins')) {
      var list = S.admins();
      p.appendChild(el('h3', { text: 'Admins' }));
      p.appendChild(el('p', { 'class': 'a-fine', text: 'Open a person to change what they can edit, reset their password or remove them.' }));
      p.appendChild(el('div', { 'class': 'fold-list' }, list.map(function (a) { return userFold(a, list); }).concat([addAdminFold(list)])));
    }
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
