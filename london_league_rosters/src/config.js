const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const TOOL_DIR = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(TOOL_DIR, "cache");
const PAGE_CACHE_DIR = path.join(CACHE_DIR, "pages");
const SEASON_CACHE_DIR = path.join(CACHE_DIR, "seasons");

module.exports = {
  ROOT_DIR,
  TOOL_DIR,
  CACHE_DIR,
  PAGE_CACHE_DIR,
  SEASON_CACHE_DIR,
  FIXTURE_RESULTS_URL: "https://competitions.volleyzone.co.uk/fixture-and-results/lva/",
  AJAX_URL:
    "https://competitions.volleyzone.co.uk/wp-admin/admin-ajax.php?action=fetch_season_competitions",
  PAGE_TITLE: "Fixture and Results",
  LAST_SEGMENT: "lva",
};
