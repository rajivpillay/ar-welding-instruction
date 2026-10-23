/* Sim to Steel — Unit 4 Integration Plan
   Runs after activities.js (which restores and autosaves the form).
   1. Fills the "From Unit 3" fields from the saved Alignment Table, if they are empty.
   2. Check my plan: lists empty parts of the template.
   3. Downloads the plan in three layouts: written (.txt), table (.csv), calendar (.csv). */
(function () {
  'use strict';
  var form = document.getElementById('plan-form');
  if (!form) return;
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* ---- 1. Pre-fill from the Unit 3 Alignment Table ---- */
  var table = {};
  try { table = JSON.parse(localStorage.getItem('simtosteel.form.alignment-table') || '{}'); } catch (e) {}
  var ROWS = ['c2-3', 'c1-3', 'c2-1', 'c5-1', 'c5-2', 'c8-1', 'c6-3', 'own1', 'own2'];
  function label(k) {
    if (k.indexOf('own') === 0) return (table[k + '-std'] || '').split('\n')[0].trim();
    return k.toUpperCase().replace('-', '.');
  }
  var live = [], sim = [];
  ROWS.forEach(function (k) {
    var name = label(k); if (!name) return;
    if (table[k + '-safe'] === 'Yes') {
      var haz = Object.keys(table).filter(function (f) { return f.indexOf(k + '-haz-') === 0; }).map(function (f) { return table[f]; });
      live.push(name + (haz.length ? ': ' + haz.join(', ') : ''));
    }
    var r = table[k + '-rate'];
    if (r === 'Supported') sim.push(name + ' (supported)');
    if (r === 'Partially supported') sim.push(name + ' (partially): ' + (table[k + '-part'] || 'part not named'));
  });
  var status = form.querySelector('.plan-u3-status');
  var any = Object.keys(table).some(function (f) { return /-rate$/.test(f); });
  if (!any && status) {
    status.innerHTML = 'Your Unit 3 Alignment Table is empty in this browser. <a href="unit-3-task.html#alignment-table">Complete it first</a>, then come back, or fill these in yourself.';
  }
  var changed = false;
  $all('[data-u3]', form).forEach(function (el) {
    if (el.value.trim()) return;
    var list = el.getAttribute('data-u3') === 'live' ? live : sim;
    if (list.length) { el.value = list.join('\n'); changed = true; }
  });
  if (changed) {
    form.dispatchEvent(new Event('input', { bubbles: true }));
    if (status) status.textContent = 'Filled in from your Unit 3 Alignment Table.';
  }

  /* ---- Collect the plan in order ---- */
  function sectionOf(el) { var fs = el.closest('fieldset'); var lg = fs && fs.querySelector('legend'); return lg ? lg.textContent.trim() : ''; }
  function items() {
    return $all('[data-q]', form).map(function (q) {
      var el = q.querySelector('textarea, input');
      return { section: sectionOf(q), q: q.getAttribute('data-q'), a: el ? el.value.trim() : '', el: el, label: q.querySelector('label').textContent.trim() };
    });
  }

  /* ---- 2. Check my plan ---- */
  var chk = form.querySelector('[data-check-plan]'), out = form.querySelector('.plan-check');
  if (chk) chk.addEventListener('click', function () {
    var empty = items().filter(function (it) { return !it.a; });
    out.innerHTML = empty.length
      ? '<p><strong>' + empty.length + ' part' + (empty.length > 1 ? 's' : '') + ' of the template still empty.</strong></p><ul>' +
        empty.map(function (it) { return '<li>' + esc(it.section) + ': ' + esc(it.q) + '</li>'; }).join('') + '</ul>'
      : '<p><strong>Every part of the template is filled in.</strong> Now score your plan with the rubric.</p>';
    if (empty.length) empty[0].el.focus();
  });

  /* ---- 3. Downloads ---- */
  function csvCell(s) { return '"' + String(s).replace(/"/g, '""') + '"'; }
  function save(text, name, type) {
    var blob = new Blob([text], { type: type });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function written() {
    var lines = [form.getAttribute('data-title'), ''], last = '';
    items().forEach(function (it) {
      if (it.section !== last) { lines.push('', it.section.toUpperCase()); last = it.section; }
      lines.push(it.q + ':', it.a || '(blank)', '');
    });
    return lines.join('\n');
  }
  function tableCsv() {
    var rows = [['Section', 'Part', 'Your plan']];
    items().forEach(function (it) { rows.push([it.section, it.q, it.a]); });
    return rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
  }
  function calendarCsv() {
    var all = items(), get = function (q) { var f = all.filter(function (it) { return it.q === q; })[0]; return f ? f.a : ''; };
    var weeks = parseInt(get('Weeks in the term'), 10); if (!(weeks > 0 && weeks < 60)) weeks = 18;
    var rows = [['Integration Plan: ' + (get('Course') || 'course') + ', ' + (get('Term') || 'term')], []];
    all.forEach(function (it) { if (it.section.indexOf('Plan basics') !== 0) rows.push([it.q, it.a]); });
    rows.push([], ['Week', 'Simulator practice', 'Demonstrations', 'Live instruction and safety', 'Students moving to the booth', 'Notes']);
    for (var w = 1; w <= weeks; w++) rows.push(['Week ' + w, '', '', '', '', '']);
    return rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
  }
  $all('[data-plan-download]', form).forEach(function (b) {
    b.addEventListener('click', function () {
      var kind = b.getAttribute('data-plan-download');
      if (kind === 'written') save(written(), 'integration-plan.txt', 'text/plain');
      if (kind === 'table') save('﻿' + tableCsv(), 'integration-plan-table.csv', 'text/csv');
      if (kind === 'calendar') save('﻿' + calendarCsv(), 'integration-plan-calendar.csv', 'text/csv');
    });
  });
})();
