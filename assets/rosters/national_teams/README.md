# National Team Rosters

These JSON files are formatted for direct import into the scoring app's single-team roster importer.

## Scope
- Current top 10 men's and top 10 women's national teams
- Ranking basis:
  - Men: top 10 from the latest ranking snapshot shown on Wikipedia's `FIVB Senior World Rankings` page as of 5 October 2025
  - Women: top 10 from the latest ranking snapshot shown on Wikipedia's `FIVB Senior World Rankings` page as of 29 June 2025
- Roster basis:
  - 2025 FIVB Men's / Women's World Championship squad pages on Wikipedia when available
  - team or player Wikipedia pages for coach/captain support where needed

## Ranking Source
- https://en.wikipedia.org/wiki/FIVB_Senior_World_Rankings

## Team Coverage

### Men
- Poland
- Italy
- Brazil
- France
- United States
- Slovenia
- Japan
- Argentina
- Bulgaria
- Canada

### Women
- Italy
- Brazil
- Poland
- Turkey
- Japan
- China
- United States
- Netherlands
- Dominican Republic
- Canada

## Captain Notes

The scoring app expects exactly one captain entry for team-details validation. Where the latest squad source did not explicitly mark a captain, a best-effort current captain was assigned for import readiness.

### Explicit captain support used
- `poland_men.json`: Bartosz Kurek
- `italy_men.json`: Simone Giannelli
- `france_men.json`: Benjamin Toniutti
- `slovenia_men.json`: Tine Urnaut
- `japan_men.json`: Yuki Ishikawa
- `argentina_men.json`: Luciano De Cecco
- `italy_women.json`: Anna Danesi
- `brazil_women.json`: Gabi Guimaraes
- `turkey_women.json`: Eda Erdem Dundar
- `japan_women.json`: Mayu Ishikawa
- `china_women.json`: Gong Xiangyu

### Best-effort captain assignments to verify later
- `brazil_men.json`: Ricardo Lucarelli
- `united_states_men.json`: Micah Christenson
- `bulgaria_men.json`: Aleks Grozdanov
- `canada_men.json`: Nicholas Hoag
- `poland_women.json`: Agnieszka Korneluk
- `united_states_women.json`: Jordyn Poulter
- `netherlands_women.json`: Britt Bongaerts
- `dominican_republic_women.json`: Brenda Castillo
- `canada_women.json`: Vicky Savard

## Caveats
- These files are intended to be import-ready rather than authoritative federation records.
- `regNumber` is left blank throughout.
- Bench personnel currently includes the head coach only.
