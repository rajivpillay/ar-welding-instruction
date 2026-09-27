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
})();
