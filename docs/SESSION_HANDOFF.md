# Session Handoff

## Purpose
Use this file before switching devices so the next session can resume fast.

## Scope
- This file is session-specific and may refer to only one app/workstream at a time.
- Use `docs/CHANGE_STASH.md` for the longer-lived cross-app backlog.

## Current Snapshot
- Date: 2026-04-08
- Branch: `scoring_app_history_load_work`
- Last commit: `0725b63 Extend scoring team details so roster entries can represent players, bench staff, or both, with new bench-role input and a dedicated Bench Personnel section above regular players and liberos.`
- Working tree status: `docs/CHANGE_STASH.md` modified after the last commit to record delivered work and add the new scoring-app subrole backlog item.

## In Progress
- Task being worked on: Scoring-app team-details expansion and follow-up planning.
- What was done this session:
  - Added bench personnel support to the scoring app Team Details flow.
  - Reworked roster entry input into a unified person-entry form:
    - `Name`
    - `Is Player`
    - `Shirt Number`
    - `Reg Number`
    - `Libero`
    - `Captain`
    - `Bench Role`
  - Added bench-role values:
    - `Coach`
    - `Assistant Coach 1`
    - `Assistant Coach 2`
    - `Therapist`
    - `Medical`
  - Added a new `Bench Personnel` section above `Regular Players` and `Liberos`.
  - Added rule parameter `allowPlayerStaffRoleCumulation` and wired it through:
    - presets
    - rules form
    - rules JSON import/export
    - match snapshots
  - Kept roster JSON backward-compatible with older exports.
  - Updated `docs/CHANGE_STASH.md` so the delivered bench-personnel item is marked complete.
- What is left to do:
  - Commit the current docs-only change to `docs/CHANGE_STASH.md` and this refreshed handoff file.
  - Decide whether the next scoring step should be:
    - optional non-libero `subrole` support in roster tables
    - or another stash item

## Next Recommended Step
1. Commit the current docs updates.
2. If continuing scoring work, pick up the new stash item:
   - Add optional non-libero player `subrole` selected from `Setter`, `Outside Hitter`, `Opposite`, `Middle Blocker`
   - Display corresponding roster symbols `S`, `OH`, `OP`, `MB`
3. When implementing that feature, reuse the current roster-entry expansion pattern rather than introducing a separate model just for subroles.

## Validation / Testing
- What was tested:
  - User manually verified the new scoring Team Details behavior in-browser.
  - Bench personnel display and roster editing worked as expected.
  - Rules-controlled player/staff role cumulation worked.
  - Quick save/load and roster/rules persistence behavior appeared correct after the schema extension.
- What still needs testing:
  - Additional manual check of older roster JSON imports into the new roster-entry model.
  - Saved custom rules/profile interactions after the new cumulation field was added.
- Known edge cases:
  - Bench-role uniqueness is enforced per team.
  - Non-player entries must have a bench role.
  - If cumulation is disabled in rules, a single entry cannot be both player and bench staff.

## Key Files Touched
- `assets/js/current/main_game_scoring.js`
- `assets/js/core/Rules.js`
- `assets/js/core/MatchStateSerializer.js`
- `game_scoring/index.html`
- `docs/CHANGE_STASH.md`

## Risks / Watchouts
- `assets/js/current/main_game_scoring.js` is still large and handling multiple concerns.
- Any future roster schema additions should stay backward-aware for older roster JSON and snapshots.
- The scoring roster model now represents both players and non-player staff, so any later code that assumes every roster entry is a player should be reviewed carefully.

## Resume Prompt (Copy/Paste)
Read `docs/CHANGE_STASH.md` and `docs/SESSION_HANDOFF.md`, summarize current scoring-app state, then continue with: <task>.
