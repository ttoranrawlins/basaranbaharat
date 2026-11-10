/* Başaran Baharat — tiny enhancements. Site works without JS (except the quote summary). */
(function () {
  'use strict';
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

  if (btnCopy) btnCopy.addEventListener('click', function () {
    if (!out.value) { out.focus(); return; }
    var label = btnCopy.querySelector('span');
    function done() { if (label) { label.textContent = T.copied; setTimeout(function () { label.textContent = T.copy; }, 1800); } }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(out.value).then(done, function () { out.select(); document.execCommand('copy'); done(); }); }
    else { out.select(); try { document.execCommand('copy'); done(); } catch (e) {} }
  });
})();
