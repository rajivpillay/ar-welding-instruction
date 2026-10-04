/* Sim to Steel — interactive activities
   One script, reused by every unit page. Each activity is plain HTML
   marked with a data attribute; this file adds the behavior.
   Works by keyboard; feedback is text plus a symbol, never color alone. */
(function () {
  'use strict';

  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function mark(ok) {
    return '<span class="mark" aria-hidden="true">' + (ok ? '✓' : '✗') + '</span> ' +
           '<span class="mark">' + (ok ? 'Correct.' : 'Not quite.') + '</span> ';
  }

  /* ---- Hotspot: numbered buttons over an image, one info panel ---- */
  $all('[data-hotspot]').forEach(function (box) {
    var panel = box.querySelector('.hotspot-panel');
    var btns = $all('.hotspot', box);
    btns.forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var src = document.getElementById(b.getAttribute('data-info'));
        btns.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        panel.innerHTML = src ? src.innerHTML : '';
      });
    });
  });

  /* ---- Choice sets: one radio group per item, checked together ---- */
  $all('[data-choice-set]').forEach(function (set) {
    var items = $all('fieldset[data-answer]', set);
    var result = set.querySelector('.result');
    var check = set.querySelector('[data-check]');
    var reset = set.querySelector('[data-reset]');

    check.addEventListener('click', function () {
      var right = 0, answered = 0;
      items.forEach(function (fs) {
        var chosen = fs.querySelector('input:checked');
        var fb = fs.querySelector('.fb');
        if (!chosen) { fb.className = 'fb'; fb.innerHTML = 'Choose an answer for this one.'; return; }
        answered++;
        var ok = chosen.value === fs.getAttribute('data-answer');
        if (ok) right++;
        fb.className = 'fb ' + (ok ? 'is-ok' : 'is-bad');
        fb.innerHTML = mark(ok) + (fs.getAttribute('data-explain') || '');
      });
      result.textContent = right + ' of ' + items.length + ' correct' +
        (answered < items.length ? ' (' + (items.length - answered) + ' not answered)' : '') + '.';
    });
    if (reset) {
      reset.addEventListener('click', function () {
        items.forEach(function (fs) {
          $all('input', fs).forEach(function (i) { i.checked = false; });
          var fb = fs.querySelector('.fb'); fb.className = 'fb'; fb.innerHTML = '';
        });
        result.textContent = '';
        var first = set.querySelector('input'); if (first) first.focus();
      });
    }
  });

  /* ---- Multiple choice: feedback written for each option ---- */
  $all('[data-mcq]').forEach(function (q) {
    var fb = q.querySelector('.fb');
    q.querySelector('[data-check]').addEventListener('click', function () {
      var chosen = q.querySelector('input:checked');
      if (!chosen) { fb.className = 'fb'; fb.innerHTML = 'Choose an answer first.'; return; }
      var ok = chosen.hasAttribute('data-correct');
      fb.className = 'fb ' + (ok ? 'is-ok' : 'is-bad');
      fb.innerHTML = mark(ok) + chosen.getAttribute('data-feedback');
    });
  });

  /* ---- Reveal: write first, then compare ---- */
  $all('[data-reveal]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var showText = btn.textContent, hideText = btn.getAttribute('data-hide-text') || 'Hide';
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
      btn.textContent = open ? showText : hideText;
      if (!open) { var h = panel.querySelector('h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
    });
  });

  /* ---- Autosave form: kept in this browser, downloadable as text ---- */
  $all('form[data-autosave]').forEach(function (form) {
    var key = 'simtosteel.form.' + form.getAttribute('data-autosave');
    var status = form.querySelector('.save-status');
    function read() { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; } }
    function write(o) { try { localStorage.setItem(key, JSON.stringify(o)); return true; } catch (e) { return false; } }
    function collect() {
      var o = {};
      $all('input, textarea', form).forEach(function (el) {
        if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
        else if (el.name) { o[el.name] = el.value; }
      });
      return o;
    }
    var saved = read();
    $all('input, textarea', form).forEach(function (el) {
      if (!(el.name in saved)) return;
      if (el.type === 'radio') el.checked = (saved[el.name] === el.value);
      else el.value = saved[el.name];
    });
    if (Object.keys(saved).length) status.textContent = 'Restored your saved answers from this browser.';

    form.addEventListener('input', function () {
      status.textContent = write(collect()) ? 'Saved in this browser.' : 'Could not save in this browser. Download a copy before you leave.';
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    var dl = form.querySelector('[data-download]');
    if (dl) dl.addEventListener('click', function () {
      var lines = [form.getAttribute('data-title') || 'My answers', ''];
      $all('[data-q]', form).forEach(function (q) {
        lines.push(q.getAttribute('data-q'));
        var picked = q.querySelector('input:checked');
        if (q.querySelector('input[type="radio"]')) lines.push('Answer: ' + (picked ? picked.value : '(none)'));
        var hasRadios = !!q.querySelector('input[type="radio"]');
        $all('textarea', q).forEach(function (el) { lines.push((hasRadios ? 'Notes: ' : 'Answer: ') + (el.value || '(blank)')); });
        lines.push('');
      });
      var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (form.getAttribute('data-autosave') || 'answers') + '.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    var clr = form.querySelector('[data-clear]');
    if (clr) clr.addEventListener('click', function () {
      form.reset();
      try { localStorage.removeItem(key); } catch (e) {}
      status.textContent = 'Cleared.';
    });
  });
})();
