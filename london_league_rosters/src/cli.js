const { getFixtureResultsPage, getSeasonCompetitions } = require("./http");
const {
  parseSeasonOptions,
  parseDivisionOptions,
} = require("./parseFixtureResults");
const {
  parseSeasonCompetitionsResponse,
} = require("./fetchSeasonCompetitions");

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

async function cmdSeasons() {
  const refresh = hasFlag("--refresh");
  const { text, cachePath, fromCache } = await getFixtureResultsPage({ refresh });
  const seasons = parseSeasonOptions(text);
  printJson({
    source: "fixture_results_page",
    cachePath,
    fromCache,
    seasons,
  });
}

async function cmdCurrentDivisions() {
  const refresh = hasFlag("--refresh");
  const { text, cachePath, fromCache } = await getFixtureResultsPage({ refresh });
  const seasons = parseSeasonOptions(text);
  const divisions = parseDivisionOptions(text);
  const currentSeason = seasons.find((season) => season.selected) || null;
  printJson({
    source: "fixture_results_page",
    cachePath,
    fromCache,
    currentSeason,
    divisions,
  });
}

async function cmdSeasonInfo() {
  const seasonId = getArgValue("--season-id");
  if (!seasonId) {
    throw new Error("Missing required --season-id");
  }
  const refresh = hasFlag("--refresh");
  const { text, cachePath, fromCache } = await getSeasonCompetitions(seasonId, {
    refresh,
  });
  const parsed = parseSeasonCompetitionsResponse(text);
  printJson({
    seasonId: Number(seasonId),
    cachePath,
    fromCache,
    parsed,
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
    default:
      process.stderr.write(
        "Usage: node src/cli.js <seasons|current-divisions|season-info> [--season-id N] [--refresh]\n"
      );
      process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
