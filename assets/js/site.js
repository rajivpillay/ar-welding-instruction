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
