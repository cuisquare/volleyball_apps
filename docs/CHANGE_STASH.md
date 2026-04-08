# Change Stash

## Purpose
Track planned work across devices and sessions.  
Update this file whenever an item is added, completed, or reprioritized.

## Active Items
- [ ] Player substitutions during sets.
- [ ] End-of-set / mid-game / end-game output reporting.
- [ ] In-game display of player positions on court at all times.
- [ ] JSON input/output workflow polish beyond current implementation.
- [ ] Codebase refactor review: split responsibilities from `main_game_scoring.js` into classes/modules.
- [ ] Game penalties: data model/history support.
- [ ] Game penalties: in-app recording at event time (type + recipient: team/player/coach/bench).
- [ ] Team details extension with bench personnel input (coach, assistant coach, technical, medical), below liberos.
- [ ] Set start/end time input and tracking.
- [ ] Timeout input during sets with rule validation.
- [ ] Rules support for timeouts-per-set with decider differences:
  - FIVB: 2 all sets
  - London League: 2 regular sets, 0 decider set

## Completed Items
- [x] Rules JSON import/export from Rules panel.
- [x] Team roster JSON import/export per team (Home/Away separate buttons).
- [x] Removed combined two-team roster import/export.
- [x] Setup import guard: rules/rosters import only before match start; exports always allowed.
- [x] Export filenames improved:
  - roster exports include team name
  - rules exports include rules/profile label
  - full snapshot exports include team names + match stage + timestamp
- [x] Team Details layout updated to 2 team panels with team-name input at top of each panel.
- [x] Save/load game state and history (quick save/load + JSON import/export) with pre-toss restore fix.

## Notes
- If scope changes, add a short rationale under the item.
- Keep completed items here until merged/released, then optionally archive.
