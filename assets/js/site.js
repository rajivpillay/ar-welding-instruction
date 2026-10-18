/* AR Welding Instruction — shared behavior
   Units dropdown (pointer + keyboard) and theme toggle. */
(function () {
  'use strict';

  /* ---- Units dropdown ---- */
  var toggle = document.querySelector('.dropdown-toggle');
  var menu = document.getElementById('units-menu');
  var parent = toggle && toggle.closest('.dropdown');
  var wide = window.matchMedia('(min-width: 46rem)');

  function openMenu()  { menu.classList.add('is-open');    toggle.setAttribute('aria-expanded', 'true');  }
  function closeMenu() { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }

  if (toggle && menu && parent) {
    toggle.addEventListener('click', function () {
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    parent.addEventListener('mouseenter', function () { if (wide.matches) openMenu(); });
    parent.addEventListener('mouseleave', function () { if (wide.matches) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!parent.contains(e.target)) closeMenu();
    });
    parent.addEventListener('focusout', function (e) {
      if (!parent.contains(e.relatedTarget)) closeMenu();
    });
  }


  /* ---- Unit sidebar: mobile disclosure ---- */
  var unitToggle = document.getElementById('unit-nav-toggle');
  var unitParts  = document.getElementById('unit-parts');
  if (unitToggle && unitParts) {
    unitToggle.addEventListener('click', function () {
      var open = unitParts.classList.toggle('is-open');
      unitToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- Per-part completion, stored per browser ---- */
  var PKEY = 'simtosteel.progress';

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(PKEY) || '{}'); }
    catch (e) { return {}; }
  }
  function writeProgress(obj) {
    try { localStorage.setItem(PKEY, JSON.stringify(obj)); } catch (e) {}
  }
  function paintProgress() {
    var done = readProgress();
    var marks = document.querySelectorAll('[data-done-for]');
    for (var i = 0; i < marks.length; i++) {
      var key = marks[i].getAttribute('data-done-for');
      marks[i].hidden = !done[key];
    }
    var btn = document.querySelector('[data-mark-complete]');
    if (btn) {
      var k = btn.getAttribute('data-mark-complete');
      btn.textContent = done[k] ? 'Completed \u2014 undo' : 'Mark complete';
      btn.setAttribute('aria-pressed', done[k] ? 'true' : 'false');
    }
  }
  var markBtn = document.querySelector('[data-mark-complete]');
  if (markBtn) {
    markBtn.addEventListener('click', function () {
      var k = markBtn.getAttribute('data-mark-complete');
      var done = readProgress();
      if (done[k]) { delete done[k]; } else { done[k] = true; }
      writeProgress(done);
      paintProgress();
    });
  }
  if (document.querySelector('[data-done-for]')) { paintProgress(); }

  /* ---- Theme toggle: follows the system, remembers an explicit choice ---- */
  var btn = document.getElementById('theme-toggle');
  var root = document.documentElement;
  var KEY = 'arweld.theme';

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function isDark() {
    var s = stored();
    return s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function apply(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    btn.textContent = dark ? 'Light mode' : 'Dark mode';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  if (btn) {
    apply(isDark());
    btn.addEventListener('click', function () {
      var next = !(root.getAttribute('data-theme') === 'dark');
      try { localStorage.setItem(KEY, next ? 'dark' : 'light'); } catch (e) {}
      apply(next);
    });
  }

  /* ---- Worked-example dialogs (D-026) ----
     Native modal <dialog>: the page behind is inert while it is open.
     Escape, either Close button, or a click on the backdrop closes it,
     and focus returns to the button that opened it. */
  var dlgOpeners = document.querySelectorAll('[data-dialog]');
  for (var d = 0; d < dlgOpeners.length; d++) {
    (function (opener) {
      var dlg = document.getElementById(opener.getAttribute('data-dialog'));
      if (!dlg || typeof dlg.showModal !== 'function') return;
      opener.addEventListener('click', function () {
        dlg.showModal();
        document.documentElement.classList.add('dialog-open');
      });
      dlg.addEventListener('close', function () {
        document.documentElement.classList.remove('dialog-open');
        opener.focus();
      });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      var closers = dlg.querySelectorAll('[data-dialog-close]');
      for (var c = 0; c < closers.length; c++) {
        closers[c].addEventListener('click', function () { dlg.close(); });
      }
    })(dlgOpeners[d]);
  }
})();

/* ---- Usability study (Week 5): participant code, active time, survey links ----
   Set STUDY.on to false after the study to hide every study block.
   Nothing leaves the browser unless the participant opens a survey and submits it.
   ?studyreset on any page clears this browser's code, time and quiz scores (facilitator test runs). */
(function () {
  'use strict';
  var STUDY = {
    on: true,
    /* Pre-filled link templates, from the "Links" tab of the response spreadsheet */
    forms: {
      start: 'https://docs.google.com/forms/d/e/1FAIpQLSeBC5ZKn5McUK-_FOa5JfZB_xG2s8bmA_oDOoBTE4iyhaw90w/viewform?usp=pp_url&entry.587827526=P00',
      unit1: 'https://docs.google.com/forms/d/e/1FAIpQLSfc1GgntSPllLG-adE6zIFo5quJKDBP82n6qRmbY9KPSkhcnA/viewform?usp=pp_url&entry.280512277=P00&entry.22745067=XXPREXX&entry.577024479=XXKCXX&entry.2139575870=XXMIRXX&entry.1017573358=XXATTXX&entry.1388034874=XXMOVXX&entry.1646965313=XXMPQXX&entry.33779330=XXMKBXX&entry.1966815093=XXMKCXX&entry.605455709=XXMTKXX&entry.195107699=XXMTOTXX',
      closing: 'https://docs.google.com/forms/d/e/1FAIpQLSfU2EwMM_XX02ixcpNLwRpDa9Ztne716d1XBAlr_Kxwg7sVYg/viewform?usp=pp_url&entry.1716820111=P00&entry.1047213837=XXPREXX&entry.1353875123=XXKCXX&entry.684539596=XXMIRXX&entry.1497220372=XXATTXX&entry.972137857=XXMOVXX&entry.183565158=XXMPQXX&entry.1804141712=XXMKBXX&entry.1059273920=XXMKCXX&entry.1624309938=XXMTKXX&entry.994668953=XXMTOTXX'
    }
  };
  var SKEY = 'simtosteel.study', TKEY = 'simtosteel.time', QKEY = 'simtosteel.scores';
  function read(k) { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) { return {}; } }
  function write(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }

  if (/[?&]studyreset\b/.test(location.search)) {
    try { [SKEY, TKEY, QKEY].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
  }
  if (!STUDY.on) return;

  /* Which unit part is this page? The AR System Evaluation is the Unit 1 Task's work page. */
  var name = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
  var m = name.match(/^unit-([12])(?:-(pre-quiz|knowledge-building|knowledge-check|task|summary))?$/);
  var here = m ? { unit: 'u' + m[1], part: m[2] || 'overview' }
           : (name === 'ar-system-evaluation' ? { unit: 'u1', part: 'task' } : null);

  /* Active time: counts only while this tab is visible and the person has been active
     in the last 10 minutes. Focus inside an embedded video counts as active, because
     clicks inside the player don't reach the page. */
  if (here) {
    var IDLE = 10 * 60 * 1000, TICK = 5000, last = Date.now(), prev = Date.now();
    var touch = function () { last = Date.now(); };
    ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart', 'focusin'].forEach(function (ev) {
      window.addEventListener(ev, touch, { passive: true, capture: true });
    });
    var inVideo = function () { var a = document.activeElement; return !!a && a.tagName === 'IFRAME'; };
    var tick = function () {
      var now = Date.now(), dt = Math.min(now - prev, TICK * 2); prev = now;   /* cap: sleep or throttled timers */
      if (document.visibilityState !== 'visible') return;
      if (now - last > IDLE && !inVideo()) return;
      var t = read(TKEY); t[here.unit] = t[here.unit] || {};
      t[here.unit][here.part] = Math.round(((t[here.unit][here.part] || 0) + dt / 1000) * 10) / 10;
      write(TKEY, t);
    };
    setInterval(tick, TICK);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') { prev = Date.now(); last = Date.now(); } else { tick(); }
    });
    window.addEventListener('pagehide', tick);
  }

  /* Survey links, built at click time so scores and minutes are current */
  function mins(sec) { return String(Math.round((sec || 0) / 60)); }
  function surveyUrl(key) {
    var tpl = STUDY.forms[key]; if (!tpl) return '';
    var url = tpl.replace(/=P00(&|$)/, '=' + encodeURIComponent(read(SKEY).code || '') + '$1');
    if (key === 'start') return url;
    var u = key === 'unit1' ? '1' : '2', sc = read(QKEY), t = read(TKEY)['u' + u] || {};
    var pre = sc['unit-' + u + '-pre'], kc = sc['unit-' + u + '-kc'];
    var total = ['overview', 'pre-quiz', 'knowledge-building', 'knowledge-check', 'task']
      .reduce(function (n, p) { return n + (t[p] || 0); }, 0);
    var map = {
      XXPREXX: pre ? pre.score : '', XXKCXX: kc ? kc.score : '',
      XXMIRXX: kc && kc.mirror != null ? kc.mirror : '', XXATTXX: kc ? (kc.attempts || 1) : '',
      XXMOVXX: mins(t.overview), XXMPQXX: mins(t['pre-quiz']), XXMKBXX: mins(t['knowledge-building']),
      XXMKCXX: mins(t['knowledge-check']), XXMTKXX: mins(t.task), XXMTOTXX: mins(total)
    };
    Object.keys(map).forEach(function (k) { url = url.replace(k, encodeURIComponent(map[k])); });
    return url;
  }
  var links = document.querySelectorAll('[data-survey]');
  function paintLinks() {
    for (var i = 0; i < links.length; i++) {
      var k = links[i].getAttribute('data-survey');
      if (STUDY.forms[k]) links[i].href = surveyUrl(k);
    }
  }
  for (var i = 0; i < links.length; i++) {
    (function (a) {
      var key = a.getAttribute('data-survey');
      if (!STUDY.forms[key]) return;          /* block stays hidden until the link is configured */
      var box = a.closest('[data-study]'); if (box) box.hidden = false;
      a.addEventListener('click', function () { a.href = surveyUrl(key); });
    })(links[i]);
  }
  paintLinks();

  /* Participant code */
  var codeForm = document.querySelector('[data-study-code]');
  if (codeForm) {
    var input = codeForm.querySelector('input'), msg = codeForm.querySelector('[aria-live]');
    var saved = read(SKEY).code; if (saved) { input.value = saved; msg.textContent = 'Saved: ' + saved + '.'; }
    codeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim().toUpperCase();
      if (!/^P\d{2}$/.test(v)) {
        input.setAttribute('aria-invalid', 'true');
        msg.textContent = 'Use the code you were given: a P followed by two digits, for example P03.';
        input.focus(); return;
      }
      input.removeAttribute('aria-invalid'); input.value = v;
      var s = read(SKEY); s.code = v; write(SKEY, s);
      msg.textContent = 'Saved: ' + v + '. Your surveys will fill it in.';
      paintLinks();
    });
  }
})();
