# Change Stash

## Purpose
Track planned work across devices and sessions.  
Update this file whenever an item is added, completed, or reprioritized.

## Active Items

### Scoring App
- [ ] Player substitutions during sets.
- [ ] End-of-set / mid-game / end-game output reporting.
- [ ] In-game display of player positions on court at all times.
- [ ] JSON input/output workflow polish beyond current implementation.
- [ ] Codebase refactor review: split responsibilities from `main_game_scoring.js` into classes/modules.
- [ ] Game penalties: data model/history support.
- [ ] Game penalties: in-app recording at event time (type + recipient: team/player/coach/bench).
- [ ] Add an optional non-libero player `subrole` field selected from fully spelled role values `Setter`, `Outside Hitter`, `Opposite`, and `Middle Blocker`, and display the corresponding symbols `S`, `OH`, `OP`, and `MB` in the roster tables.
- [ ] Sort bench personnel display by the defined bench-role order from the input dropdown, rather than by insertion or alphabetical order, with `Coach` first, then `Assistant Coach 1`, `Assistant Coach 2`, `Therapist`, and `Medical`.
- [ ] Introduce match-wide action undo/redo that restores full prior states rather than only current-set points, and move the undo/redo controls from the scoreboard into a globally visible app-level controls section alongside save/load and JSON import/export.
- [ ] Display points-scored history and recorded set start/end times in the scoring app.

### Positions App
- [ ] Saved named formations/patterns for persisted court layouts, linked to role symbols across rotations.
- [ ] CSS organization review to mirror `current` / `dev` / `core` app structure more clearly.
- [ ] UI/UX review for persistence controls and saved-layout management.

### Shared / Repo-Wide
- [ ] Decide whether `docs/SESSION_HANDOFF.md` should stay as a rolling single-session file or become app-scoped.
- [ ] Review whether CSS files should follow the same `current` / `dev` / `core` structure as JS where applicable.

## Completed Items

### Scoring App
- [x] Rules JSON import/export from Rules panel.
- [x] Team roster JSON import/export per team (Home/Away separate buttons).
- [x] Removed combined two-team roster import/export.
- [x] Setup import guard: rules/rosters import only before match start; exports always allowed.
- [x] Export filenames improved:
  - roster exports include team name
  - rules exports include rules/profile label
  - full snapshot exports include team names + match stage + timestamp
- [x] Team Details layout updated to 2 team panels with team-name input at top of each panel.
- [x] Team details extension with bench personnel input and display, including rules-controlled player/staff role cumulation.
- [x] Team Details extended to support rostered vs non-rostered entries, a wider eligible-player pool, and a combined `Eligible Players` / `Unrostered Players` section with roster/unroster controls.
- [x] Introduced a pending set-start workflow where applying a lineup stages the next set and `Start Set` finalizes the lineup and begins play.
- [x] Set start/end time tracking with official and actual set times, including rules-controlled break duration between sets.
- [x] Timeout recording during sets with rules-controlled limits, scoreboard request buttons, and used/max timeout tracking per team.
- [x] Save/load game state and history (quick save/load + JSON import/export) with pre-toss restore fix.

### Positions App
- [x] Split positions app JS into `current`, `dev`, and `core` structure.
- [x] Added responsive court resizing for the dev positions app.
- [x] Added persistent per-rotation court layout memory in dev mode.
- [x] Added broader dev session persistence for lineup, roster, appearance, court side, and court orientation.

## Notes
- Use app-specific sections so this file can track multiple workstreams in the same repo.
- If scope changes, add a short rationale under the item.
- Keep completed items here until merged/released, then optionally archive.
