const {
  getFixtureResultsPage,
  getSeasonCompetitions,
  getFixturesByCompetitionGroup,
} = require("./http");
const {
  parseSeasonOptions,
  parseDivisionOptions,
  parseDivisionOptionsFromFragment,
  parseCompetitionGroupOptions,
  parseCompetitionGroupOptionsFromFragment,
} = require("./parseFixtureResults");
const {
  parseSeasonCompetitionsResponse,
} = require("./fetchSeasonCompetitions");
const { generateCurrentSeason } = require("./generateSeason");
const { generateDivision } = require("./generateDivision");
const { getProfile, listProfiles } = require("./profiles");

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
  const { text, cachePath, fromCache } = await getFixtureResultsPage(profile, {
    refresh,
  });
  const seasons = parseSeasonOptions(text);
  const currentSeason = seasons.find((season) => season.selected) || null;
  let divisions = [];
  let groups = [];
  let filtered = false;
  let divisionSource = "fixture_results_page";
  let groupCachePath = null;
  let groupFromCache = null;

  if (mode === "filtered") {
    if (!profile.groupFilter) {
      throw new Error(
        `Profile '${profile.id}' does not define filtered division discovery.`
      );
    }
    if (!currentSeason) {
      throw new Error("Unable to determine current season for filtered division discovery");
    }

    const seasonResponse = await getSeasonCompetitions(profile, currentSeason.seasonId, {
      refresh,
    });
    const parsedSeason = parseSeasonCompetitionsResponse(seasonResponse.text);
    if (!parsedSeason.ok) {
      throw new Error(
        `Unable to parse season competition response for season ${currentSeason.seasonId}`
      );
    }

    groups = parseCompetitionGroupOptionsFromFragment(parsedSeason.groupsSeason);
    if (!groups.length) {
      groups = parseCompetitionGroupOptions(text);
    }

    const matchingGroup = groups.find((group) =>
      (group.seasonName || "")
        .toLowerCase()
        .includes(profile.groupFilter.seasonNameContains.toLowerCase())
    );

    if (!matchingGroup) {
      throw new Error(
        `Could not find a competition group matching '${profile.groupFilter.seasonNameContains}' for profile '${profile.id}'.`
      );
    }

    const fixCompgrpID = profile.groupFilter.buildFixCompgrpID({
      selectedGroupId: matchingGroup.groupId,
      seasonId: currentSeason.seasonId,
      profile,
    });

    const filteredResponse = await getFixturesByCompetitionGroup(
      profile,
      currentSeason.seasonId,
      fixCompgrpID,
      { refresh }
    );
    divisions = parseDivisionOptionsFromFragment(filteredResponse.text);
    filtered = true;
    divisionSource = "competition_group_filtered";
    groupCachePath = filteredResponse.cachePath;
    groupFromCache = filteredResponse.fromCache;
  } else {
    divisions = parseDivisionOptions(text);
    groups = parseCompetitionGroupOptions(text);
  }

  printJson({
    profile,
    source: divisionSource,
    mode,
    cachePath,
    fromCache,
    currentSeason,
    groups,
    filtered,
    groupCachePath,
    groupFromCache,
    divisions,
  });
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
    default:
      process.stderr.write(
        "Usage: node src/cli.js <profiles|seasons|current-divisions|season-info|generate-current-season|generate-division> [--profile ID] [--mode raw|filtered] [--season-id N] [--competition-id N] [--division-name NAME] [--refresh]\n"
      );
      process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
