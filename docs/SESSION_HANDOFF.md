# Session Handoff

## Purpose
Use this file before switching devices so the next session can resume fast.

## Scope
- This file is session-specific and may refer to only one app/workstream at a time.
- Use `docs/CHANGE_STASH.md` for the longer-lived cross-app backlog.

## Current Snapshot
- Date: 2026-04-08
- Branch: `scoring_app_history_load_work`
- Last commit: `6ad7925 Refine setup JSON workflows and team-details layout for clearer roster management`
- Working tree status: untracked docs folder (`?? docs/`) pending commit.

## In Progress
- Task being worked on: JSON import/export UX and Team Details panel layout cleanup.
- What was done this session:
  - Added Rules panel JSON import/export.
  - Added per-team roster JSON import/export (Home/Away separate).
  - Removed combined two-team roster import/export flow.
  - Added pre-match-only guard for setup imports (rules + roster); exports remain always available.
  - Updated export filenames:
    - rules file names include rules/profile label
    - roster file names include team name
    - full match snapshot file names include both team names + stage + timestamp
  - Updated Team Details layout to two team cards only, with team-name input at top of each team card.
  - Removed roster side metadata from single-team roster JSON (import destination determines side).
  - Added cross-device tracking docs:
    - `docs/CHANGE_STASH.md`
    - `docs/SESSION_HANDOFF.md`
- What is left to do:
  - Manual verification pass in browser for all new JSON paths after the latest refinements.
  - Commit docs files (and any remaining uncommitted changes) when satisfied.

## Next Recommended Step
1. Run a focused UI test matrix:
   - export/import rules JSON pre-match
   - export/import home roster JSON pre-match
   - export/import away roster JSON pre-match
   - verify imports are blocked after `Start Match`
   - verify full snapshot export filename stage tags (`pre_match`, `set_n`, `game_over`)
2. If all pass, commit current state including `docs/`.

## Validation / Testing
- What was tested:
  - Per user feedback: recent JSON flows and layout changes were reported as working.
- What still needs testing:
  - Team roster import when team name is empty in JSON.
  - Rules import interaction with unsaved custom values currently shown in the form.
  - Filename token sanitization for special characters/accented team names.
- Known edge cases:
  - Importing team roster JSON intentionally does not carry home/away identity; destination button controls side.
  - Roster imports mark team details/toss/lineups as needing reconfirmation by design.

## Key Files Touched
- `assets/js/current/main_game_scoring.js`
- `game_scoring/index.html`
- `assets/css/styles_scoring.css`

## Risks / Watchouts
- `assets/js/current/main_game_scoring.js` remains large; feature work is increasing complexity.
- Keep JSON schema changes backward-aware if older exported files are expected to be loaded.

## Resume Prompt (Copy/Paste)
Read `docs/CHANGE_STASH.md` and `docs/SESSION_HANDOFF.md`, summarize current state, then continue with: <task>.
