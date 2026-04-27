const path = require("path");
const { writeText } = require("./http");
const { seasonLabelToSlug } = require("./normalize");
const { getProfileSeasonOutputDir } = require("./config");
const { discoverSeasonDivisions } = require("./discoverSeasonDivisions");
const { exportMatchPeople } = require("./exportMatchPeople");
const { logProgress } = require("./progress");

async function exportSeasonMatchPeople({
  profile,
  seasonId,
  seasonLabel,
  refresh = false,
  skipExisting = false,
  mode,
} = {}) {
  const discovery = await discoverSeasonDivisions(profile, seasonId, {
    refresh,
    mode,
  });
  logProgress(
    `Discovered ${discovery.divisions.length} divisions for ${profile.id} ${seasonLabel} using ${discovery.mode} mode`
  );

  const exports = [];
  for (const [index, division] of discovery.divisions.entries()) {
    logProgress(
      `Exporting division ${index + 1}/${discovery.divisions.length}: ${division.name}`
    );
    exports.push(
      await exportMatchPeople({
        profile,
        seasonId,
        seasonLabel,
        competitionId: division.competitionId,
        divisionName: division.name,
        refresh,
        skipExisting,
      })
    );
  }

  const seasonSlug = seasonLabelToSlug(seasonLabel);
  const seasonDir = getProfileSeasonOutputDir(profile, seasonSlug);
  const indexPath = path.join(seasonDir, "match_exports.json");
  const indexJson = {
    type: "volleyzone_match_export_index",
    profileId: profile.id,
    competitionLabel: profile.competitionLabel,
    seasonId,
    seasonLabel,
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
  logProgress(`Wrote season export index: ${indexPath}`);

  return {
    profileId: profile.id,
    seasonId,
    seasonLabel,
    seasonSlug,
    divisionsExported: exports,
    indexPath,
  };
}

module.exports = {
  exportSeasonMatchPeople,
};
