# AR Welding Instruction — EID 690 Capstone

Self-paced professional development website preparing secondary CTE welding
instructors to evaluate augmented reality welding tools, interpret simulator
feedback, and plan the transition from AR simulation to live welding.

Rajiv Pillay — MS Learning Experience Design and Educational Technology,
National University.

**Live:** https://rajivpillay.github.io/ar-welding-instruction/

## Status

Project Milestone 1 — course shell. Unit content in development.

## Structure

```
index.html           Home — title, header image, objectives, unit grid
introduction.html    Placeholder (Week 2)
syllabus.html        Placeholder (Week 2)
calendar.html        Placeholder (Week 2)
planning-tools.html  Job aids, reachable from any unit
unit-1.html          Orientation and Goal Setting
unit-2.html          The AR-Supported Welding Experience
unit-3.html          Interpreting Simulator Feedback
unit-4.html          Building an Integration Plan
style-preview.html   Design system reference — not part of the course
assets/css/site.css  Design tokens and components
assets/js/site.js    Nav dropdown and theme toggle
```

## Design and accessibility

Target: WCAG 2.2 Level AA. Every color pair is contrast-verified; ratios and
the reasoning behind each design decision are recorded in `DESIGN-LOG.md`,
kept outside this repository with the project's working files.

- Semantic landmarks, one `h1` per page, no heading-level skips
- Skip link on every page
- Navigation underline animates on hover **and** keyboard focus
- Units dropdown works by pointer, keyboard, and Escape
- All motion respects `prefers-reduced-motion`
- Light and dark themes, both meeting AA

All CSS and JavaScript in this project is original. No third-party template
code is used.

## Privacy

No participant data is stored in this repository. Learner progress, when
implemented, uses browser `localStorage` only — it never leaves the viewer's
device.
