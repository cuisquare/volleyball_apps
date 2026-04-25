# VolleyZone Roster Utility

This root-level utility is intended to make roster extraction reproducible for competitions that use the same VolleyZone competition-management stack.

It is separate from the app runtime code because it is a data-generation tool rather than part of `game_scoring` or the positions apps.

The hand-curated roster set under `assets/rosters/london_league/` remains the checked-in reference output for London League. The JS generator writes into `volleyzone_rosters/output/` so generated runs can be reviewed without overwriting curated files.

## Goals

- discover available seasons from the public fixture/results page for a selected competition profile
- discover competition and division ids from the same public interface
- cache the raw HTML / AJAX responses used for extraction
- provide a reproducible JS pathway for generating roster files into `volleyzone_rosters/output/`

## Current Scope

The current implementation is profile-based, with London League as the default profile and room to extend to other competitions using the same underlying system.

The generator currently supports:

- listing available profiles
- listing the seasons exposed on a profile's public fixture/results page
- listing the current divisions either from the raw page dropdown or from the filtered group-based AJAX flow where supported
- calling and caching the season-change AJAX endpoint used by the site
- fetching division fixture data from the same JSON endpoint the site uses
- fetching squad pages and teamsheets
- generating roster JSON files and division READMEs in `volleyzone_rosters/output/<profile>/`
- exporting normalized match-level CSV data for one division or a whole current season
- exporting normalized match-level CSV data for a chosen season or the current season

## Profiles

Current built-in profiles:

- `london_league`
- `nvl`
- `ve_nvl`
- `ve_super_league`

The non-London profiles are initial configuration targets; they still need live verification and quality review before being treated as reliable.

## Division Modes

`current-divisions` supports:

- `--mode raw`
  Parse the base `select_comp` dropdown from the page HTML.
- `--mode filtered`
  Follow the profile's configured competition-group AJAX flow and return the browser-visible filtered division list where supported.

If no mode is passed, the profile default is used.

## Commands

From repo root:

```bash
node volleyzone_rosters/src/cli.js profiles
node volleyzone_rosters/src/cli.js seasons --profile london_league
node volleyzone_rosters/src/cli.js current-divisions --profile london_league
node volleyzone_rosters/src/cli.js current-divisions --profile nvl --mode raw
node volleyzone_rosters/src/cli.js current-divisions --profile nvl --mode filtered
node volleyzone_rosters/src/cli.js season-info --profile london_league --season-id 3484
node volleyzone_rosters/src/cli.js generate-division --profile london_league --season-id 3881 --season-label 2025-2026 --competition-id 209510 --division-name "Men's Division 1B"
node volleyzone_rosters/src/cli.js generate-current-season --profile london_league
node volleyzone_rosters/src/cli.js export-match-people --profile london_league --season-id 3881 --season-label 2025-2026 --competition-id 209501 --division-name "Women's Premier Division"
node volleyzone_rosters/src/cli.js export-season-match-people --profile london_league --season-id 3881 --season-label 2025-2026
node volleyzone_rosters/src/cli.js export-current-season-match-people --profile london_league
node volleyzone_rosters/src/cli.js export-current-season-match-people --profile london_league --skip-existing
```

Equivalent npm scripts:

```bash
cd volleyzone_rosters
npm run profiles
npm run seasons -- --profile london_league
npm run current-divisions -- --profile london_league
npm run current-divisions -- --profile nvl --mode raw
npm run current-divisions -- --profile nvl --mode filtered
npm run season-info -- --profile london_league --season-id 3484
npm run generate-division -- --profile london_league --season-id 3881 --season-label 2025-2026 --competition-id 209510 --division-name "Men's Division 1B"
npm run generate-current-season -- --profile london_league
npm run export-match-people -- --profile london_league --season-id 3881 --season-label 2025-2026 --competition-id 209501 --division-name "Women's Premier Division"
npm run export-season-match-people -- --profile london_league --season-id 3881 --season-label 2025-2026
npm run export-current-season-match-people -- --profile london_league
npm run export-current-season-match-people -- --profile london_league --skip-existing
```

## Cache Layout

Cache is now profile-aware:

- `cache/pages/<profile>/`
- `cache/seasons/<profile>/`
- `cache/divisions/<profile>/`
- `cache/squads/<profile>/`
- `cache/teamsheets/<profile>/`

## Output Layout

Generated output is also profile-aware:

- `output/<profile>/`

Match export output is season-aware:

- `output/<profile>/<season_slug>/<division_slug>/`

Match export commands write:

- `matches.csv`
- `match_people.csv`

inside each division folder, and the season bulk exports write a `match_exports.json` index file into the season folder.

When re-running exports, `--skip-existing` will leave any division alone if both CSV files already exist and `--refresh` is not set.

This allows London League, NVL, Super League, and similar competition families to coexist without overwriting one another.

## Notes On Historical Seasons

Historical season support remains dependent on what the public fixture/results page exposes for a given profile.

The same general approach still applies:

- read season ids from the public season dropdown
- inspect the `fetch_season_competitions` AJAX response for that profile
- use the same division and teamsheet flow where the site exposes it cleanly

The presence of a configured profile does not yet guarantee that historical generation is fully working for that competition; that still needs to be validated per profile.
