# VolleyZone Roster Generator Stash

## Purpose
Track progress on the JS-based VolleyZone roster generator separately from the scoring app stash.

Use this file to record:
- what the generator can already do
- where generated output is weaker than the curated manual roster set
- what should be improved next

## Current State

### Implemented So Far
- Root-level utility scaffold exists under `volleyzone_rosters/`.
- Raw source caching is in place for:
  - fixture/results pages
  - season AJAX responses
  - division fixture JSON
  - squad pages
  - teamsheets
- CLI commands exist for:
  - listing exposed seasons
  - listing current divisions
  - inspecting season AJAX responses
  - generating one division
  - generating the current season
- Output is directed to `volleyzone_rosters/output/` so generated files do not overwrite the curated checked-in roster set in `assets/rosters/london_league/`.
- The site-discovery model is established:
  - season ids from the public season dropdown
  - division ids from the public division dropdown / fixture-results flow
  - eligible-player pool from squad pages
  - shirt-number / matchday enrichment from teamsheets
- The tool has been renamed and refactored toward profile-based competition support rather than a London-League-only wrapper.

### Quality / Limitations
- The JS generator is not yet the authoritative workflow.
- The curated roster set in `assets/rosters/london_league/` remains higher quality than generator output.
- `men_1b` had to be restored from the manual extraction because generated output was not yet as good.
- Historical season support is scaffolded conceptually, but older-season discovery still needs verification and refinement.
- Shirt-number recovery is still weaker in code than in the best manual passes, especially when several teamsheets must be cross-checked.
- Non-London profiles have only been configured structurally so far; they are not yet verified as working end to end.

## Active Items
- [ ] Review current `generate-division` output against curated manual divisions and document exact gaps by category:
  - team discovery
  - eligible-player completeness
  - shirt-number recovery
  - role/coach capture
  - README quality
- [ ] Make one division reproducible to curated quality, starting with a target division to be chosen when work resumes.
- [ ] Verify the newly added competition profiles (`ve_nvl`, `ve_super_league`) against live fixture/results pages and confirm their `lastSegment`, source URL, and response shape.
- [ ] Improve teamsheet parsing and cross-fixture enrichment so shirt numbers are recovered from multiple teamsheets rather than a weaker single-pass output.
- [ ] Add a comparison workflow between `volleyzone_rosters/output/` and curated roster folders such as `assets/rosters/london_league/`.
- [ ] Verify and document how historical-season discovery should work from the public season dropdown and related AJAX responses.
- [ ] Improve generator README output so each generated division README documents confidence level, source coverage, and any placeholder shirt numbers.
- [ ] Decide whether the generator should eventually be trusted to write directly into `assets/rosters/london_league/`, or whether a review-and-promote workflow should remain mandatory.

## Notes
- Treat `assets/rosters/london_league/` as curated reference data until generator quality is demonstrably comparable.
- Prefer documenting generator weaknesses explicitly rather than silently accepting weaker output.
- If a manual division restoration is needed again, record it here so the generator gap remains visible.
