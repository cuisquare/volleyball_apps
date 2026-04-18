# Change Stash

## Purpose
Track planned work across devices and sessions.  
Update this file whenever an item is added, completed, or reprioritized.

## Active Items

### Scoring App
- [ ] End-of-set / mid-game / end-game output reporting.
- [ ] In-game display of player positions on court at all times.
- [ ] JSON input/output workflow polish beyond current implementation.
- [ ] Codebase refactor review: split responsibilities from `main_game_scoring.js` into classes/modules.
- [ ] Game penalties: data model/history support.
- [ ] Game penalties: in-app recording at event time (type + recipient: team/player/coach/bench).
- [ ] Extend discipline-sanction support for expulsion and disqualification so affected players become ineligible for the current set or the rest of the match respectively, with resulting impacts on lineup legality, substitution eligibility, and incomplete-team edge cases that may forfeit a set or match.
- [ ] Add exceptional substitution support, with exact implementation rules to be checked from the official regulations, but broadly allowing a constrained override path beyond normal substitution limits and pair restrictions when an exceptional substitution is permitted.
- [ ] Add libero retirement handling, with exact rule constraints to be verified from the official regulations, so an unfit libero can be declared out of the match and replaced by an eligible regular player acting as libero for the remainder of the game.
- [ ] Add an optional non-libero player `subrole` field selected from fully spelled role values `Setter`, `Outside Hitter`, `Opposite`, and `Middle Blocker`, and display the corresponding symbols `S`, `OH`, `OP`, and `MB` in the roster tables.
- [ ] Introduce match-wide action undo/redo that restores full prior states rather than only current-set points, and move the undo/redo controls from the scoreboard into a globally visible app-level controls section alongside save/load and JSON import/export.
- [ ] Display points-scored history and recorded set start/end times in the scoring app.
- [ ] Add a match notes interface so scorers can record in-game remarks such as missing equipment, referee absence, or reasons for delayed start, and persist those notes in match state/output.
- [ ] Add an interface to select one MVP for each team from the active playing roster.
- [ ] Generate a PDF output that fills an FIVB scoresheet from the information recorded through the app, mirroring a completed paper scoresheet as closely as possible.
- [ ] Add player-level match statistics capture, including scorer identity and action categories such as attack, block, assist, and reception quality.
- [ ] Add match-metadata capture for official warm-up time, official first-serve time, venue, competition, division, competition name, competition gender, senior/junior category, country code, team three-letter codes, referees with names and registration numbers, scorer and assistant scorer where applicable, and line-judge names for 2- or 4-line-judge configurations.
- [ ] Add a game-summary panel, toggled from the top menu like the other main panels, that shows full per-set accumulated match information in a symmetrical tabular layout mirroring the FIVB scoresheet Results section, including points scored, timeouts, substitutions, and set duration in minutes.
- [ ] Rework the top-menu navigation and controls, which are becoming cluttered and unfocused as more scoring-app panels and actions are added.
- [ ] Add fixture-based London League import in the scoring app, using `london_league_rosters` facilities to load current-season teamsheets/rosters from the website after selecting a division, home team, and away team, with either live-populated or cached/static fixture values.

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
- [x] Team Details roster management refined with a shared modal add/edit/remove flow, inline roster/unroster quick actions, bench personnel ordering by role, and formatted `Last name, initials` display with full-name hover support.
- [x] Introduced a pending set-start workflow where applying a lineup stages the next set and `Start Set` finalizes the lineup and begins play.
- [x] Set start/end time tracking with official and actual set times, including rules-controlled break duration between sets.
- [x] Timeout recording during sets with rules-controlled limits, scoreboard request buttons, and used/max timeout tracking per team.
- [x] Player substitutions during sets, including rules-controlled per-set limits, lineup-panel substitution workflow, pair-based return validation, score-at-sub capture, and per-team substitution usage tracking.
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
