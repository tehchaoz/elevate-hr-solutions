/* Elevate HR Solutions: admin screen (demo, browser-only). Needs js/store.js. */
(function () {
  'use strict';
  var S = window.ElevateStore, el = S.el;
  function $(s, r) { return (r || document).querySelector(s); }
  var SESS = 'elevate.sess', LOCK = 'elevate.lock', TTL = 30 * 60 * 1000;
  var me = null, tab = 'colors', statusT;

  /* ---------- session + throttle ---------- */
  function getSess() { try { var s = JSON.parse(sessionStorage.getItem(SESS)); return s && s.exp > Date.now() ? s : null; } catch (e) { return null; } }
  function setSess(email) { try { sessionStorage.setItem(SESS, JSON.stringify({ email: email, exp: Date.now() + TTL })); } catch (e) {} }
  function touch() { var s = getSess(); if (s) setSess(s.email); }
  function lockState() { try { return JSON.parse(localStorage.getItem(LOCK)) || { n: 0, until: 0 }; } catch (e) { return { n: 0, until: 0 }; } }
  function setLock(o) { try { localStorage.setItem(LOCK, JSON.stringify(o)); } catch (e) {} }
  function say(msg, bad) { var s = $('#status'); s.textContent = msg; s.className = 'a-status' + (bad ? ' bad' : ''); clearTimeout(statusT); statusT = setTimeout(function () { s.textContent = ''; }, 4000); }

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
  var TABS = [['colors', 'Colors'], ['services', 'Services'], ['faq', 'FAQ'], ['team', 'Team'], ['admins', 'Admins'], ['account', 'Account']];
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
    ({ colors: colorsPanel, services: servicesPanel, faq: faqPanel, team: teamPanel, admins: adminsPanel, account: accountPanel })[tab](p);
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
      say('Colors saved. Open the site in this browser to see them.');
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
    p.appendChild(el('p', { 'class': 'a-fine', text: 'Download your edits to keep a copy or move them to another browser. Passwords are included only as scrambled hashes.' }));
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
  function logout() { try { sessionStorage.removeItem(SESS); } catch (e) {} me = null; location.reload(); }
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
      if (a && ok) { setLock({ n: 0, until: 0 }); me = a; setSess(a.email); $('#l-pw').value = ''; showApp(); return; }
      lk.n = (lk.n || 0) + 1; if (lk.n >= 5) { lk.until = Date.now() + 5 * 60000; lk.n = 0; } setLock(lk);
      msg.textContent = 'Email or password is not right.';
    });
  });

  var s = getSess();
  if (s) { var a0 = S.admins().filter(function (x) { return x.email === s.email; })[0]; if (a0) { me = a0; showApp(); } }
})();
