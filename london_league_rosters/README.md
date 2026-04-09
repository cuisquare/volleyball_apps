# London League Roster Utility

This root-level utility is intended to make the London League roster extraction reproducible.

It is separate from the app runtime code because it is a data-generation tool rather than part of `game_scoring` or the positions apps.

## Goals

- discover available London League seasons from the public fixture/results page
- discover competition and division ids from the same public interface
- cache the raw HTML / AJAX responses used for extraction
- provide a reproducible JS pathway for generating the roster files in `assets/rosters/london_league/`

## Current Scope

The first pass focuses on season-aware discovery and caching:

- list the seasons exposed in the public season dropdown
- list the current season divisions exposed in the public division dropdown
- call and cache the season-change AJAX endpoint used by the site

That gives us a clean base for moving the manual extraction logic into code.

## Commands

From repo root:

```bash
node london_league_rosters/src/cli.js seasons
node london_league_rosters/src/cli.js current-divisions
node london_league_rosters/src/cli.js season-info --season-id 3484
```

Equivalent npm scripts:

```bash
cd london_league_rosters
npm run seasons
npm run current-divisions
npm run season-info -- --season-id 3484
```

## Cache Layout

- `cache/pages/`
  raw fixture/results pages
- `cache/seasons/`
  cached season AJAX responses

## Notes On Historical Seasons

The public fixture/results page exposes historical season ids in the season dropdown. At the time this scaffold was created, those ids included:

- `3881` `2025-2026`
- `3484` `2024-2025`
- `3402` `2023-2024`

The site also uses a WordPress AJAX endpoint, `fetch_season_competitions`, when the season dropdown changes. This scaffold caches that response so we can inspect and refine the historical-season flow without losing reproducibility.
