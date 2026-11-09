/* Sim to Steel — Unit Task self-score.
   Builds a score-your-work panel from the page's own rubric table (table.rubric), so the
   rubric text lives in one place. Scores and the reflection save in this browser only. */
(function () {
  var box = document.querySelector('[data-selfscore]');
  var table = document.querySelector('table.rubric');
  if (!box || !table) return;
  var key = 'sts-selfscore-' + box.getAttribute('data-selfscore');
  var levels = ['2', '1', '0'];
  var names = { '2': 'Complete', '1': 'Partial', '0': 'Not yet' };

  var rows = [].slice.call(table.querySelectorAll('tbody tr')).map(function (tr) {
    var cells = tr.querySelectorAll('td');
    return { name: tr.querySelector('th').textContent.trim(),
             text: { '2': cells[0].textContent.trim(), '1': cells[1].textContent.trim(), '0': cells[2].textContent.trim() } };
  });
  var max = rows.length * 2;

  function load() { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(key, JSON.stringify(s)); } catch (e) {} }
  var state = load(); state.scores = state.scores || {};

  var form = document.createElement('form');
  form.className = 'selfscore__form';
  form.setAttribute('novalidate', '');
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  rows.forEach(function (r, i) {
    var fs = document.createElement('fieldset'); fs.className = 'selfscore__row';
    var lg = document.createElement('legend'); lg.textContent = (i + 1) + '. ' + r.name; fs.appendChild(lg);
    var opts = document.createElement('div'); opts.className = 'selfscore__opts';
    levels.forEach(function (lv) {
      var id = key + '-r' + i + '-' + lv;
      var lab = document.createElement('label'); lab.className = 'selfscore__opt'; lab.setAttribute('for', id);
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'row' + i; inp.value = lv; inp.id = id;
      if (state.scores[i] === lv) inp.checked = true;
      var head = document.createElement('span'); head.className = 'selfscore__lv'; head.textContent = lv + ' — ' + names[lv];
      var desc = document.createElement('span'); desc.className = 'selfscore__desc'; desc.textContent = r.text[lv];
      lab.appendChild(inp); lab.appendChild(head); lab.appendChild(desc); opts.appendChild(lab);
    });
    fs.appendChild(opts);
    var fb = document.createElement('p'); fb.className = 'selfscore__fb'; fb.id = key + '-fb' + i; fs.appendChild(fb);
    form.appendChild(fs);
  });

  var total = document.createElement('div'); total.className = 'selfscore__total';
  total.innerHTML = '<p class="selfscore__sum" aria-live="polite"></p><div class="selfscore__meter" aria-hidden="true"></div><p class="selfscore__msg"></p>';
  for (var p = 0; p < max; p++) { var pip = document.createElement('span'); pip.className = 'selfscore__pip'; total.querySelector('.selfscore__meter').appendChild(pip); }
  form.appendChild(total);

  var refl = document.createElement('div'); refl.className = 'selfscore__reflect field';
  var rid = key + '-reflect';
  refl.innerHTML = '<label for="' + rid + '">Reflect: what would you change to raise your lowest row, or what will you keep doing? <span class="muted">(optional)</span></label><textarea id="' + rid + '" rows="3"></textarea>';
  form.appendChild(refl);
  var ta = refl.querySelector('textarea'); ta.value = state.reflect || '';
  ta.addEventListener('input', function () { state.reflect = ta.value; save(state); });

  var actions = document.createElement('p'); actions.className = 'selfscore__actions';
  actions.innerHTML = '<button type="button" class="btn btn--ghost btn--sm">Clear my scores</button>';
  actions.querySelector('button').addEventListener('click', function () {
    state = { scores: {} }; save(state);
    [].forEach.call(form.querySelectorAll('input[type=radio]'), function (x) { x.checked = false; });
    ta.value = ''; paint();
  });
  form.appendChild(actions);

  form.addEventListener('change', function (e) {
    if (e.target.type !== 'radio') return;
    state.scores[e.target.name.slice(3)] = e.target.value; save(state); paint();
  });

  function paint() {
    var sum = 0, n = 0;
    rows.forEach(function (r, i) {
      var v = state.scores[i], fb = document.getElementById(key + '-fb' + i);
      if (v === undefined) { fb.textContent = ''; fb.className = 'selfscore__fb'; return; }
      sum += +v; n++;
      if (v === '2') { fb.textContent = 'This row meets the objective.'; fb.className = 'selfscore__fb is-ok'; }
      else { fb.textContent = 'To reach 2: ' + r.text['2']; fb.className = 'selfscore__fb is-gap'; }
    });
    var pips = total.querySelectorAll('.selfscore__pip');
    for (var k = 0; k < pips.length; k++) pips[k].classList.toggle('is-on', k < sum);
    total.querySelector('.selfscore__sum').textContent = n ? ('Your score: ' + sum + ' of ' + max + (n < rows.length ? ' (' + (rows.length - n) + ' row' + (rows.length - n > 1 ? 's' : '') + ' left to score)' : '')) : 'Choose a level for each row.';
    var msg = total.querySelector('.selfscore__msg');
    if (n < rows.length) msg.textContent = '';
    else if (sum === max) msg.textContent = 'A 2 in every row: your work meets the unit objective. Choose Mark complete below.';
    else msg.textContent = 'Revise the rows below 2 using the notes above, then score them again. A 2 in every row meets the unit objective.';
  }
  box.appendChild(form);
  paint();
})();
