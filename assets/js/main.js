/* Başaran Baharat — tiny enhancements. Site works without JS (except the quote summary). */
(function () {
  'use strict';
  // language: `/` sends visitors to their last chosen language (default English); every other page remembers its own language
  if (document.body.classList.contains('pg-root')) {
    var saved = '';
    try { saved = localStorage.getItem('bb_lang') || ''; } catch (e) {}
    window.location.replace(saved === 'tr' ? document.body.getAttribute('data-tr') : document.body.getAttribute('data-en'));
    return;
  }
  try { var lg = document.documentElement.lang; if (lg === 'tr' || lg === 'en') localStorage.setItem('bb_lang', lg); } catch (e) {}
  // close mobile menu on link click / Escape / outside click
  var menu = document.querySelector('details.menu');
  if (menu) {
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.removeAttribute('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.removeAttribute('open'); });
    document.addEventListener('click', function (e) { if (menu.hasAttribute('open') && !menu.contains(e.target)) menu.removeAttribute('open'); });
  }

  // quote builder
  var form = document.getElementById('quote-form');
  if (!form) return;
  var T = {};
  try { T = JSON.parse(form.getAttribute('data-i18n')); } catch (e) {}
  var out = document.getElementById('qf-out');
  var btnCopy = form.querySelector('[data-act="copy"]');
  var btnMail = form.querySelector('[data-act="mail"]');
  var btnWa = form.querySelector('[data-act="wa"]');
  var email = form.getAttribute('data-email') || '';
  var wa = (form.getAttribute('data-wa') || '').replace(/[^0-9]/g, '');
  var subject = form.getAttribute('data-subject') || '';

  function val(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function build() {
    var picked = Array.prototype.slice.call(form.querySelectorAll('input[name="urun"]:checked')).map(function (i) { return i.getAttribute('data-label'); });
    if (!picked.length) return '';
    var lines = [T.intro, '', T.products + ': ' + picked.join(', '), T.qty + ': ' + val('qty'), T.form + ': ' + val('form')];
    if (val('name')) lines.push(T.name + ': ' + val('name'));
    if (val('phone')) lines.push(T.phone + ': ' + val('phone'));
    if (val('note')) lines.push(T.note + ': ' + val('note'));
    return lines.join('\n');
  }
  function refresh() {
    var txt = build();
    out.value = txt || '';
    out.placeholder = T.empty || '';
    if (btnMail) { if (email) { btnMail.hidden = false; btnMail.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(txt); } }
    if (btnWa) { if (wa) { btnWa.hidden = false; btnWa.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(txt); } }
    [btnCopy, btnMail, btnWa].forEach(function (b) { if (b) { if (!txt) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled'); } });
  }
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);

  // prefill from ?urun=kimyon (comma separated allowed)
  try {
    var q = new URLSearchParams(window.location.search).get('urun');
    if (q) q.split(',').forEach(function (k) { var el = form.querySelector('input[name="urun"][value="' + k.replace(/[^a-z-]/gi, '') + '"]'); if (el) el.checked = true; });
  } catch (e) {}
  refresh();

  // direct send (Web3Forms) — only active when a key is set in the site config
  var key = form.getAttribute('data-key') || '';
  var endpoint = form.getAttribute('data-endpoint') || '';
  var btnSend = form.querySelector('[data-act="send"]');
  var btnAgain = form.querySelector('[data-act="again"]');
  var msgEl = form.querySelector('[data-role="msg"]');
  var doneEl = form.querySelector('[data-role="done"]');
  var bodyEl = form.querySelector('.qf__body');
  var headEl = form.querySelector('.qf__head');
  function hideMsg() { if (msgEl) { msgEl.hidden = true; msgEl.textContent = ''; } }
  function showMsg(t, withTel) {
    if (!msgEl) return;
    msgEl.textContent = t;
    if (withTel) {
      msgEl.appendChild(document.createTextNode(' '));
      var a = document.createElement('a'); a.href = 'tel:' + (form.getAttribute('data-tel') || ''); a.textContent = T.tel || ''; msgEl.appendChild(a);
    }
    msgEl.hidden = false;
  }
  function showDone() {
    if (!doneEl) return;
    bodyEl.hidden = true; if (headEl) headEl.hidden = true; doneEl.hidden = false;
    var h = doneEl.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  }
  function send() {
    if (!key || !btnSend) return;
    hideMsg();
    var txt = build();
    if (!txt) { showMsg(T.empty); var c = form.querySelector('input[name="urun"]'); if (c) c.focus(); return; }
    var phone = val('phone');
    if (phone.replace(/\D/g, '').length < 7) { showMsg(T.needphone); form.elements.phone.focus(); return; }
    var em = val('email');
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showMsg(T.needemail); form.elements.email.focus(); return; }
    var bc = form.elements['botcheck'];
    if (bc && bc.checked) { showDone(); return; }
    var picked = Array.prototype.slice.call(form.querySelectorAll('input[name="urun"]:checked')).map(function (i) { return i.getAttribute('data-label'); });
    var payload = { access_key: key, subject: (T.subject2 || '') + ' — ' + picked.join(', '), from_name: T.from || '', name: val('name') || '—', phone: phone,
      products: picked.join(', '), quantity: val('qty'), form: val('form'), note: val('note') || '—', message: txt };
    if (em) payload.email = em;
    var label = btnSend.textContent;
    btnSend.disabled = true; btnSend.textContent = T.sending || '…';
    var ctrl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    function unlock() { clearTimeout(to); btnSend.disabled = false; btnSend.textContent = label; }
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json().then(function (j) { return r.ok && j && j.success; }); })
      .then(function (ok) { unlock(); if (ok) showDone(); else showMsg(T.err, true); })
      .catch(function () { unlock(); showMsg(T.err, true); });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); send(); });
  if (btnAgain) btnAgain.addEventListener('click', function () {
    form.reset(); hideMsg(); bodyEl.hidden = false; if (headEl) headEl.hidden = false; doneEl.hidden = true; refresh();
  });

  if (btnCopy) btnCopy.addEventListener('click', function () {
    if (!out.value) { out.focus(); return; }
    var label = btnCopy.querySelector('span');
    function done() { if (label) { label.textContent = T.copied; setTimeout(function () { label.textContent = T.copy; }, 1800); } }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(out.value).then(done, function () { out.select(); document.execCommand('copy'); done(); }); }
    else { out.select(); try { document.execCommand('copy'); done(); } catch (e) {} }
  });
})();

// international enquiry form (Web3Forms) — separate from the quote builder above
(function () {
  'use strict';
  var f = document.getElementById('intl-form');
  if (!f) return;
  var T = {};
  try { T = JSON.parse(f.getAttribute('data-i18n')); } catch (e) {}
  var key = f.getAttribute('data-key') || '';
  var endpoint = f.getAttribute('data-endpoint') || '';
  var btn = f.querySelector('[data-act="send"]');
  var again = f.querySelector('[data-act="again"]');
  var msg = f.querySelector('[data-role="msg"]');
  var done = f.querySelector('[data-role="done"]');
  var body = f.querySelector('.qf__body');
  function val(n) { var el = f.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function hide() { msg.hidden = true; msg.textContent = ''; }
  function show(t, withMail) {
    msg.textContent = t;
    if (withMail && T.mail) {
      msg.appendChild(document.createTextNode(' '));
      var a = document.createElement('a'); a.href = 'mailto:' + T.mail; a.textContent = T.mail; msg.appendChild(a);
    }
    msg.hidden = false;
  }
  function showDone() {
    body.hidden = true; done.hidden = false;
    var h = done.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  }
  function send() {
    hide();
    var name = val('name'), company = val('company'), em = val('email'), other = val('other');
    var checked = Array.prototype.slice.call(f.querySelectorAll('input[name="product"]:checked'));
    if (!name) { show(T.need_name); f.elements.name.focus(); return; }
    if (!company) { show(T.need_company); f.elements.company.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { show(T.need_email); f.elements.email.focus(); return; }
    if (!checked.length && !other) { show(T.need_products); var c = f.querySelector('input[name="product"]'); if (c) c.focus(); return; }
    var bc = f.elements['botcheck'];
    if (bc && bc.checked) { showDone(); return; }
    var products = checked.map(function (i) { return i.getAttribute('data-en'); }).join(', ');
    var lines = ['Name: ' + name, 'Company: ' + company, 'Email: ' + em, 'Products: ' + (products || '—')];
    if (other) lines.push('Other products: ' + other);
    var payload = { access_key: key, subject: (T.subject || 'International enquiry') + ' — ' + company, from_name: T.from || '',
      name: name, company: company, email: em, products: products || '—', other_products: other || '—', page_language: T.lang || '', message: lines.join('\n') };
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = T.sending || '…';
    var ctrl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    function unlock() { clearTimeout(to); btn.disabled = false; btn.textContent = label; }
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json().then(function (j) { return r.ok && j && j.success; }); })
      .then(function (ok) { unlock(); if (ok) showDone(); else show(T.err, true); })
      .catch(function () { unlock(); show(T.err, true); });
  }
  f.addEventListener('submit', function (e) { e.preventDefault(); send(); });
  if (again) again.addEventListener('click', function () { f.reset(); hide(); body.hidden = false; done.hidden = true; });
})();
