/* Sim to Steel — in-text glossary definitions
   Upgrades each <a class="term-link" data-term="g-..."> (a plain link to the
   glossary page, which works without JavaScript) into a button that opens a
   short definition. Non-modal disclosure: Escape, a click elsewhere, or tabbing
   away closes it.
   TERMS must match glossary.html. Edit both together. */
(function () {
  'use strict';
  var TERMS = {
  "g-attempt": {
    "term": "Attempt",
    "tag": "Miller term",
    "def": "One try at a task, saved with its date and time and marked pass (green check) or fail (red X)."
  },
  "g-ar": {
    "term": "Augmented reality (AR)",
    "tag": "General term",
    "def": "Digital images placed over a live view of the real surroundings. In welding simulation, a virtual arc and weld are shown on a real practice piece seen through the helmet."
  },
  "g-equipment-settings": {
    "term": "Equipment settings (scored)",
    "tag": "Miller term",
    "def": "Whether the student set the machine within range, such as voltage and wire feed speed. Checked separately from technique."
  },
  "g-exercise": {
    "term": "Exercise",
    "tag": "Miller term",
    "def": "One simulated welding task, set up with a joint type, position, material thickness, process, filler, and gas."
  },
  "g-exercise-settings": {
    "term": "Exercise settings",
    "tag": "Miller term",
    "def": "Options chosen before an exercise: difficulty (Beginner, Intermediate, Advanced); equipment-setting guides on or off; equipment values preset or kept from the last session; real-time parameter guides on or off."
  },
  "g-gun-angles": {
    "term": "Gun angles",
    "tag": "Miller usage",
    "def": "The simulator’s collective term for the angles of the gun. The analysis screen reports them separately as work angle and travel angle."
  },
  "g-muscle-memory": {
    "term": "Muscle memory",
    "tag": "General term",
    "def": "Everyday term for a motor skill that becomes automatic through repetition. Vendor materials use it to claim simulator practice carries over to live welding; how much carries over is what the research is still testing."
  },
  "g-overall-score": {
    "term": "Overall score",
    "tag": "Miller term",
    "def": "The single score for an attempt, shown with the replay. On the helmet analysis screen it appears as the technique score against a target."
  },
  "g-post-weld-feedback": {
    "term": "Post-weld feedback",
    "tag": "General term",
    "def": "Feedback shown after the weld is finished, such as scores and replays, used to review a completed attempt."
  },
  "g-real-time-feedback": {
    "term": "Real-time feedback",
    "tag": "General term",
    "def": "Feedback the trainee sees while welding, so technique can be corrected mid-pass."
  },
  "g-guides": {
    "term": "Real-time parameter guides",
    "tag": "Miller term",
    "def": "On-screen markers shown during the weld for contact-tip-to-work distance, gun angles, travel speed, and aim. A guide shows red until technique is corrected, then green. Also called “guides.”"
  },
  "g-replay": {
    "term": "Replay",
    "tag": "Miller term",
    "def": "Playback of the completed simulated weld, opened from the analysis screen."
  },
  "g-helmet-shade": {
    "term": "Simulated helmet shade",
    "tag": "Miller term",
    "def": "How dark the helmet display goes during the simulated weld, adjustable from 8 to 13 to imitate a welding lens."
  },
  "g-analysis-screen": {
    "term": "Simulation analysis screen",
    "tag": "Miller term",
    "def": "The screen shown after a simulated weld. It scores each parameter; parameters highlighted in red did not pass."
  },
  "g-target-range": {
    "term": "Target and range (min, max)",
    "tag": "Miller term",
    "def": "The value an exercise aims for on each parameter, and the lowest and highest values it accepts. Shown on the exercise setup screen before the weld."
  },
  "g-teacher-software": {
    "term": "Teacher Software",
    "tag": "Miller term",
    "def": "The instructor’s program for AugmentedArc: organizes courses, reviews student attempts, monitors the classroom live, and produces reports."
  },
  "g-technique-parameters": {
    "term": "Technique parameters",
    "tag": "Miller term",
    "def": "The five things the simulator measures and scores during a weld: work angle, travel angle, CTWD, travel speed, and aim."
  },
  "g-technique-score": {
    "term": "Technique score",
    "tag": "Miller term",
    "def": "The overall score for how the student welded, shown against a target score (for example 95 against 90). Separate from the equipment-settings check."
  },
  "g-workpiece": {
    "term": "Workpiece",
    "tag": "Miller usage",
    "def": "The physical practice piece shaped like a joint (T, butt, lap, V-groove) that the helmet is aimed at. The simulated weld is laid on it."
  }
};

  var openBtn = null;
  function closeOpen(returnFocus) {
    if (!openBtn) return;
    var pop = document.getElementById(openBtn.getAttribute('aria-controls'));
    pop.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) openBtn.focus();
    openBtn = null;
  }
  function place(pop) {
    pop.style.left = '0px';
    var vw = document.documentElement.clientWidth;
    var r = pop.getBoundingClientRect();
    var shift = 0;
    if (r.right > vw - 16) shift = (vw - 16) - r.right;
    if (r.left + shift < 16) shift = 16 - r.left;
    pop.style.left = shift + 'px';
  }

  var links = document.querySelectorAll('a.term-link[data-term]');
  for (var i = 0; i < links.length; i++) {
    (function (a, n) {
      var t = TERMS[a.getAttribute('data-term')];
      if (!t) return;
      var wrap = document.createElement('span');
      wrap.className = 'term-wrap';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'term-btn';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'term-pop-' + n);
      btn.setAttribute('aria-label', 'Definition: ' + t.term);

      var pop = document.createElement('span');
      pop.className = 'term-pop';
      pop.id = 'term-pop-' + n;
      pop.hidden = true;
      var head = document.createElement('span');
      head.className = 'term-pop__head';
      var strong = document.createElement('strong');
      strong.textContent = t.term;
      var tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = t.tag;
      head.appendChild(strong); head.appendChild(document.createTextNode(' ')); head.appendChild(tag);
      var def = document.createElement('span');
      def.className = 'term-pop__def';
      def.textContent = t.def;
      var more = document.createElement('a');
      more.className = 'term-pop__more';
      more.href = 'glossary.html#' + a.getAttribute('data-term');
      more.textContent = 'Open the glossary';
      pop.appendChild(head); pop.appendChild(def); pop.appendChild(more);

      wrap.appendChild(btn); wrap.appendChild(pop);
      a.parentNode.replaceChild(wrap, a);

      btn.addEventListener('click', function () {
        if (openBtn === btn) { closeOpen(false); return; }
        closeOpen(false);
        pop.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        openBtn = btn;
        place(pop);
      });
      wrap.addEventListener('focusout', function (e) {
        if (openBtn === btn && e.relatedTarget && !wrap.contains(e.relatedTarget)) closeOpen(false);
      });
    })(links[i], i);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openBtn) closeOpen(true);
  });
  document.addEventListener('click', function (e) {
    if (openBtn && !openBtn.parentNode.contains(e.target)) closeOpen(false);
  });
  window.addEventListener('resize', function () {
    if (openBtn) place(document.getElementById(openBtn.getAttribute('aria-controls')));
  });
})();
