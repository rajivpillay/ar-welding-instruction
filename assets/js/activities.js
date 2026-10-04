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

    /* Prefill empty fields from another saved form: data-prefill="formKey:fieldName" */
    $all('[data-prefill]', form).forEach(function (el) {
      if (el.value) return;
      var parts = el.getAttribute('data-prefill').split(':');
      try {
        var other = JSON.parse(localStorage.getItem('simtosteel.form.' + parts[0]) || '{}');
        if (other[parts[1]]) { el.value = other[parts[1]]; write(collect()); }
      } catch (e) {}
    });

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
  /* ---- Quizzes: Pre-Quiz (score-only) and Knowledge Check (feedback) ----
     Question types, set on each top-level fieldset with data-type:
       single (default) - one radio; options may carry data-feedback
       multi            - checkboxes; data-answer="b,d", data-choose="2"
       sort             - .sort-row[data-answer] rows, all must be right
     The first attempt is saved in this browser; it is the score the study
     uses. A facilitator can clear saved scores by adding ?reset to the URL. */
  var SKEY = 'simtosteel.scores';
  function readScores() { try { return JSON.parse(localStorage.getItem(SKEY) || '{}'); } catch (e) { return {}; } }
  function writeScores(o) { try { localStorage.setItem(SKEY, JSON.stringify(o)); } catch (e) {} }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function qType(fs) { return fs.getAttribute('data-type') || 'single'; }
  function answered(fs) {
    var t = qType(fs);
    if (t === 'multi') return $all('input:checked', fs).length === +(fs.getAttribute('data-choose') || 1);
    if (t === 'sort') return $all('.sort-row', fs).every(function (r) { return r.querySelector('input:checked'); });
    return !!fs.querySelector('input:checked');
  }
  function correct(fs) {
    var t = qType(fs);
    if (t === 'multi') {
      var picked = $all('input:checked', fs).map(function (i) { return i.value; }).sort().join(',');
      return picked === fs.getAttribute('data-answer').split(',').sort().join(',');
    }
    if (t === 'sort') return $all('.sort-row', fs).every(function (r) {
      return r.querySelector('input:checked').value === r.getAttribute('data-answer');
    });
    return fs.querySelector('input:checked').value === fs.getAttribute('data-answer');
  }
  function showFeedback(fs, ok) {
    var fb = fs.querySelector(':scope > .fb'); if (!fb) return;
    var t = qType(fs), text = fs.getAttribute('data-explain') || '';
    if (t === 'single') { var c = fs.querySelector('input:checked'); text = c.getAttribute('data-feedback') || text; }
    if (t === 'sort') $all('.sort-row', fs).forEach(function (r) {
      var rok = r.querySelector('input:checked').value === r.getAttribute('data-answer');
      var rf = r.querySelector('.row-fb'); rf.className = 'row-fb ' + (rok ? 'is-ok' : 'is-bad');
      rf.innerHTML = '<span class="mark" aria-hidden="true">' + (rok ? '✓' : '✗') + '</span> <span class="mark">' + (rok ? 'Correct' : 'Not quite') + '</span>';
    });
    fb.className = 'fb ' + (ok ? 'is-ok' : 'is-bad');
    fb.innerHTML = mark(ok) + text;
  }
  function clearFeedback(fs) {
    $all('.fb, .row-fb', fs).forEach(function (f) { f.className = f.classList.contains('row-fb') ? 'row-fb' : 'fb'; f.innerHTML = ''; });
  }

  $all('form[data-quiz]').forEach(function (form) {
    var id = form.getAttribute('data-quiz');
    var mode = form.getAttribute('data-mode') || 'score-only';
    var items = $all(':scope > fieldset', form);
    var result = form.querySelector('.quiz-result, .result');
    var submit = form.querySelector('[type="submit"]');
    var pass = +(form.getAttribute('data-pass') || 0);
    var mirror = +(form.getAttribute('data-mirror') || 0);

    if (/[?&]reset\b/.test(location.search)) { var sc = readScores(); delete sc[id]; writeScores(sc); }

    function setLocked(on) { items.forEach(function (fs) { fs.disabled = on; }); if (submit) submit.hidden = on; }

    function scoreOnlyMessage(rec) {
      result.textContent = 'You got ' + rec.score + ' of ' + rec.total + '. This isn’t graded. ' +
        'Your score is saved in this browser, and the Knowledge Check will show you what changed.';
    }

    function feedbackMessage(score, mirrorScore, first) {
      var html = '<p class="result-score"><strong>You got ' + score + ' of ' + items.length + '.</strong></p>';
      var pre = readScores()[form.getAttribute('data-pre')];
      if (mirror && pre) {
        html += '<p>Questions 1 to ' + mirror + ' match the Pre-Quiz. Pre-Quiz: ' + pre.score + ' of ' + pre.total +
                '. This time: ' + mirrorScore + ' of ' + mirror + '.</p>';
      }
      if (first && first.attempt !== 1) html += '<p class="save-status">Your first attempt (' + first.score + ' of ' + first.total + ') is the one saved.</p>';
      var next = form.getAttribute('data-next'), nextName = form.getAttribute('data-next-name') || 'the next part';
      if (score >= pass) {
        html += '<p>You’re ready for ' + nextName + '.</p><p><a class="btn" href="' + next + '">Go to ' + nextName + '</a></p>';
      } else {
        var seen = {}, missed = [];
        items.forEach(function (fs) {
          if (fs.getAttribute('data-ok') === '1') return;
          var h = fs.getAttribute('data-topic-href'); if (!h || seen[h]) return; seen[h] = 1;
          missed.push({ n: +(fs.getAttribute('data-topic') || 0), html: '<li><a href="' + h + '">' + fs.getAttribute('data-topic-name') + '</a></li>' });
        });
        var links = missed.sort(function (a, b) { return a.n - b.n; }).map(function (m) { return m.html; });
        html += '<p>' + pass + ' or more means you’re ready for ' + nextName + '. Review these topics, then try again, or continue to the task.</p>' +
                '<ul>' + links.join('') + '</ul>' +
                '<div class="btn-row"><button type="button" class="btn btn--sm" data-retake>Try again</button>' +
                '<a class="btn btn--ghost btn--sm" href="' + next + '">Continue to ' + nextName + ' anyway</a></div>';
      }
      if (score >= pass) html += '<div class="btn-row"><button type="button" class="btn btn--ghost btn--sm" data-retake>Try again</button></div>';
      result.innerHTML = html;
      var rt = result.querySelector('[data-retake]');
      if (rt) rt.addEventListener('click', function () {
        items.forEach(function (fs) { $all('input', fs).forEach(function (i) { i.checked = false; }); clearFeedback(fs); fs.removeAttribute('data-ok'); });
        setLocked(false); result.innerHTML = '';
        var firstInput = form.querySelector('input'); if (firstInput) firstInput.focus();
      });
    }

    var prior = readScores()[id];
    if (prior && mode === 'score-only') { setLocked(true); scoreOnlyMessage(prior); }
    if (prior && mode === 'feedback') {
      result.innerHTML = '<p class="save-status">Your first attempt is saved: ' + prior.score + ' of ' + prior.total + '. You can try again below.</p>';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = items.filter(function (fs) { return !answered(fs); });
      if (missing.length) {
        var msg = 'Answer all ' + items.length + ' questions first. ' + missing.length + ' still open.';
        if (mode === 'feedback') result.innerHTML = '<p>' + esc(msg) + '</p>'; else result.textContent = msg;
        var fi = missing[0].querySelector('input'); if (fi) fi.focus();
        return;
      }
      var score = 0, mirrorScore = 0;
      items.forEach(function (fs, i) {
        var ok = correct(fs); fs.setAttribute('data-ok', ok ? '1' : '0');
        if (ok) { score++; if (i < mirror) mirrorScore++; }
        if (mode === 'feedback') showFeedback(fs, ok);
      });
      var all = readScores(), first = all[id];
      if (!first) {
        first = { score: score, total: items.length, date: new Date().toISOString().slice(0, 10), attempt: 1 };
        if (mirror) first.mirror = mirrorScore;
        all[id] = first; writeScores(all);
      } else { first = Object.assign({}, first, { attempt: 2 }); }
      setLocked(true);
      if (mode === 'score-only') scoreOnlyMessage(all[id]); else feedbackMessage(score, mirrorScore, first.attempt === 1 ? null : first);
      result.setAttribute('tabindex', '-1'); result.focus();
    });
  });
})();
