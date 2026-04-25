const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const TOOL_DIR = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(TOOL_DIR, "cache");
const OUTPUT_DIR = path.join(TOOL_DIR, "output");
const AJAX_URL = "https://competitions.volleyzone.co.uk/wp-admin/admin-ajax.php";

function getProfileCacheDirs(profile) {
  const profileId = profile.cacheSlug || profile.id;
  return {
    pages: path.join(CACHE_DIR, "pages", profileId),
    seasons: path.join(CACHE_DIR, "seasons", profileId),
    divisions: path.join(CACHE_DIR, "divisions", profileId),
    squads: path.join(CACHE_DIR, "squads", profileId),
    teamsheets: path.join(CACHE_DIR, "teamsheets", profileId),
  };
}

function getProfileOutputDir(profile) {
  const profileId = profile.outputSlug || profile.id;
  return path.join(OUTPUT_DIR, profileId);
}

function getProfileSeasonOutputDir(profile, seasonSlug) {
  return path.join(getProfileOutputDir(profile), seasonSlug);
}

module.exports = {
  ROOT_DIR,
  TOOL_DIR,
  CACHE_DIR,
  OUTPUT_DIR,
  AJAX_URL,
  getProfileCacheDirs,
  getProfileOutputDir,
  getProfileSeasonOutputDir,
};
