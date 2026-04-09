const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const TOOL_DIR = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(TOOL_DIR, "cache");
const PAGE_CACHE_DIR = path.join(CACHE_DIR, "pages");
const SEASON_CACHE_DIR = path.join(CACHE_DIR, "seasons");
const DIVISION_CACHE_DIR = path.join(CACHE_DIR, "divisions");
const SQUAD_CACHE_DIR = path.join(CACHE_DIR, "squads");
const TEAMSHEET_CACHE_DIR = path.join(CACHE_DIR, "teamsheets");
const OUTPUT_DIR = path.join(
  TOOL_DIR,
  "output"
);

module.exports = {
  ROOT_DIR,
  TOOL_DIR,
  CACHE_DIR,
  PAGE_CACHE_DIR,
  SEASON_CACHE_DIR,
  DIVISION_CACHE_DIR,
  SQUAD_CACHE_DIR,
  TEAMSHEET_CACHE_DIR,
  OUTPUT_DIR,
  FIXTURE_RESULTS_URL: "https://competitions.volleyzone.co.uk/fixture-and-results/lva/",
  AJAX_URL:
    "https://competitions.volleyzone.co.uk/wp-admin/admin-ajax.php",
  PAGE_TITLE: "Fixture and Results",
  LAST_SEGMENT: "lva",
  USER_ID: "298568",
};
