const path = require("path");
const { writeText } = require("./http");
const { seasonLabelToSlug } = require("./normalize");
const { getProfileSeasonOutputDir } = require("./config");
const { discoverCurrentDivisions } = require("./discoverCurrentDivisions");
const { exportMatchPeople } = require("./exportMatchPeople");

async function exportCurrentSeasonMatchPeople({
  profile,
  refresh = false,
  skipExisting = false,
} = {}) {
  const discovery = await discoverCurrentDivisions(profile, { refresh });
  const currentSeason = discovery.currentSeason;
  if (!currentSeason) {
    throw new Error("Unable to determine current season from fixture page");
  }

  const exports = [];
  for (const division of discovery.divisions) {
    exports.push(
      await exportMatchPeople({
        profile,
        seasonId: currentSeason.seasonId,
        seasonLabel: currentSeason.label,
        competitionId: division.competitionId,
        divisionName: division.name,
        refresh,
        skipExisting,
      })
    );
  }

  const seasonSlug = seasonLabelToSlug(currentSeason.label);
  const seasonDir = getProfileSeasonOutputDir(profile, seasonSlug);
  const indexPath = path.join(seasonDir, "match_exports.json");
  const indexJson = {
    type: "volleyzone_match_export_index",
    profileId: profile.id,
    competitionLabel: profile.competitionLabel,
    seasonId: currentSeason.seasonId,
    seasonLabel: currentSeason.label,
    seasonSlug,
    source: profile.fixtureResultsUrl,
    discoveryMode: discovery.mode,
    divisions: exports.map((entry) => ({
      competitionId: entry.competitionId,
      divisionName: entry.divisionName,
      divisionSlug: entry.divisionSlug,
      fixtureCount: entry.fixtureCount,
      peopleRowCount: entry.peopleRowCount,
      matchesCsvPath: entry.matchesCsvPath,
      matchPeopleCsvPath: entry.matchPeopleCsvPath,
      skippedFixtureIds: entry.skippedFixtureIds,
      skippedExisting: entry.skippedExisting,
    })),
  };

  await writeText(indexPath, `${JSON.stringify(indexJson, null, 2)}\n`);

  return {
    profileId: profile.id,
    season: currentSeason,
    seasonSlug,
    divisionsExported: exports,
    indexPath,
  };
}

module.exports = {
  exportCurrentSeasonMatchPeople,
};
