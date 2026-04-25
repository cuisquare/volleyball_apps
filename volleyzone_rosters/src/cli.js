const { getFixtureResultsPage, getSeasonCompetitions } = require("./http");
const { parseSeasonCompetitionsResponse } = require("./fetchSeasonCompetitions");
const { parseSeasonOptions } = require("./parseFixtureResults");
const { generateCurrentSeason } = require("./generateSeason");
const { generateDivision } = require("./generateDivision");
const { exportMatchPeople } = require("./exportMatchPeople");
const { exportSeasonMatchPeople } = require("./exportSeasonMatchPeople");
const {
  exportCurrentSeasonMatchPeople,
} = require("./exportCurrentSeasonMatchPeople");
const { getProfile, listProfiles } = require("./profiles");
const { discoverCurrentDivisions } = require("./discoverCurrentDivisions");

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index === process.argv.length - 1) {
    return null;
  }
  return process.argv[index + 1];
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function getDivisionMode(profile) {
  return getArgValue("--mode") || profile.defaultDivisionMode || "raw";
}

async function cmdSeasons() {
  const profile = getProfile(getArgValue("--profile") || "london_league");
  const refresh = hasFlag("--refresh");
  const { text, cachePath, fromCache } = await getFixtureResultsPage(profile, {
    refresh,
  });
  const seasons = parseSeasonOptions(text);
  printJson({
    profile,
    source: "fixture_results_page",
    cachePath,
    fromCache,
    seasons,
  });
}

async function cmdCurrentDivisions() {
  const profile = getProfile(getArgValue("--profile") || "london_league");
  const mode = getDivisionMode(profile);
  const refresh = hasFlag("--refresh");
  const result = await discoverCurrentDivisions(profile, { refresh, mode });
  printJson(result);
}

async function cmdSeasonInfo() {
  const profile = getProfile(getArgValue("--profile") || "london_league");
  const seasonId = getArgValue("--season-id");
  if (!seasonId) {
    throw new Error("Missing required --season-id");
  }
  const refresh = hasFlag("--refresh");
  const { text, cachePath, fromCache } = await getSeasonCompetitions(
    profile,
    seasonId,
    {
      refresh,
    }
  );
  const parsed = parseSeasonCompetitionsResponse(text);
  printJson({
    profile,
    seasonId: Number(seasonId),
    cachePath,
    fromCache,
    parsed,
  });
}

async function cmdGenerateCurrentSeason() {
  const profile = getProfile(getArgValue("--profile") || "london_league");
  const refresh = hasFlag("--refresh");
  const result = await generateCurrentSeason({ profile, refresh });
  printJson(result);
}

async function cmdGenerateDivision() {
  const profile = getProfile(getArgValue("--profile") || "london_league");
  const seasonId = getArgValue("--season-id");
  const competitionId = getArgValue("--competition-id");
  const divisionName = getArgValue("--division-name");
  if (!seasonId || !competitionId) {
    throw new Error("Missing required --season-id or --competition-id");
  }
  const refresh = hasFlag("--refresh");
  const result = await generateDivision({
    profile,
    seasonId: Number(seasonId),
    seasonLabel: getArgValue("--season-label") || String(seasonId),
    competitionId: Number(competitionId),
    divisionName,
    refresh,
  });
  printJson(result);
}

async function cmdProfiles() {
  printJson({
    profiles: listProfiles(),
  });
}

async function cmdExportMatchPeople() {
  const profile = getProfile(getArgValue("--profile") || "london_league");
  const seasonId = getArgValue("--season-id");
  const competitionId = getArgValue("--competition-id");
  const divisionName = getArgValue("--division-name");
  if (!seasonId || !competitionId) {
    throw new Error("Missing required --season-id or --competition-id");
  }
  const refresh = hasFlag("--refresh");
  const skipExisting = hasFlag("--skip-existing");
  const result = await exportMatchPeople({
    profile,
    seasonId: Number(seasonId),
    seasonLabel: getArgValue("--season-label") || String(seasonId),
    competitionId: Number(competitionId),
    divisionName,
    refresh,
    skipExisting,
  });
  printJson(result);
}

async function cmdExportCurrentSeasonMatchPeople() {
  const profile = getProfile(getArgValue("--profile") || "london_league");
  const refresh = hasFlag("--refresh");
  const skipExisting = hasFlag("--skip-existing");
  const result = await exportCurrentSeasonMatchPeople({
    profile,
    refresh,
    skipExisting,
  });
  printJson(result);
}

async function cmdExportSeasonMatchPeople() {
  const profile = getProfile(getArgValue("--profile") || "london_league");
  const seasonId = getArgValue("--season-id");
  if (!seasonId) {
    throw new Error("Missing required --season-id");
  }
  const refresh = hasFlag("--refresh");
  const skipExisting = hasFlag("--skip-existing");
  const mode = getArgValue("--mode") || profile.defaultDivisionMode || "raw";
  const result = await exportSeasonMatchPeople({
    profile,
    seasonId: Number(seasonId),
    seasonLabel: getArgValue("--season-label") || String(seasonId),
    refresh,
    skipExisting,
    mode,
  });
  printJson(result);
}

async function main() {
  const command = process.argv[2];
  switch (command) {
    case "seasons":
      await cmdSeasons();
      return;
    case "current-divisions":
      await cmdCurrentDivisions();
      return;
    case "season-info":
      await cmdSeasonInfo();
      return;
    case "generate-current-season":
      await cmdGenerateCurrentSeason();
      return;
    case "generate-division":
      await cmdGenerateDivision();
      return;
    case "profiles":
      await cmdProfiles();
      return;
    case "export-match-people":
      await cmdExportMatchPeople();
      return;
    case "export-current-season-match-people":
      await cmdExportCurrentSeasonMatchPeople();
      return;
    case "export-season-match-people":
      await cmdExportSeasonMatchPeople();
      return;
    default:
      process.stderr.write(
        "Usage: node src/cli.js <profiles|seasons|current-divisions|season-info|generate-current-season|generate-division|export-match-people|export-current-season-match-people|export-season-match-people> [--profile ID] [--mode raw|filtered] [--season-id N] [--competition-id N] [--division-name NAME] [--refresh] [--skip-existing]\n"
      );
      process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
