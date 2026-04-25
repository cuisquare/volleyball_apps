const fs = require("fs/promises");
const path = require("path");
const {
  getFixturesByCompetition,
  getTeamSheet,
  ensureDir,
} = require("./http");
const { parseFixturesByCompetitionResponse } = require("./fixturesByCompetition");
const { parseTeamsheet } = require("./parseTeamsheet");
const { buildDivisionSlug, seasonLabelToSlug } = require("./normalize");
const { getProfileSeasonOutputDir } = require("./config");
const {
  buildMatchExport,
  MATCH_COLUMNS,
  MATCH_PEOPLE_COLUMNS,
} = require("./extractMatchData");
const { writeCsv } = require("./csv");

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function exportMatchPeople({
  profile,
  seasonId,
  seasonLabel,
  competitionId,
  divisionName,
  refresh = false,
  skipExisting = false,
}) {
  const fixtureResponse = await getFixturesByCompetition(
    profile,
    seasonId,
    competitionId,
    { refresh }
  );
  const parsed = parseFixturesByCompetitionResponse(fixtureResponse.text);
  const fixtureRows = parsed.fixtureRows;
  if (!fixtureRows.length) {
    throw new Error(
      `No fixture rows found for season ${seasonId} competition ${competitionId}`
    );
  }

  const effectiveDivisionName =
    divisionName || fixtureRows[0].competitionName || `Competition ${competitionId}`;
  const divisionSlug = buildDivisionSlug(effectiveDivisionName);
  const seasonSlug = seasonLabelToSlug(seasonLabel);
  const divisionDir = path.join(
    getProfileSeasonOutputDir(profile, seasonSlug),
    divisionSlug
  );
  await ensureDir(divisionDir);
  const matchesCsvPath = path.join(divisionDir, "matches.csv");
  const matchPeopleCsvPath = path.join(divisionDir, "match_people.csv");

  if (
    skipExisting &&
    !refresh &&
    (await fileExists(matchesCsvPath)) &&
    (await fileExists(matchPeopleCsvPath))
  ) {
    return {
      profileId: profile.id,
      seasonId,
      seasonLabel,
      seasonSlug,
      competitionId,
      divisionName: effectiveDivisionName,
      divisionSlug,
      divisionDir,
      fixtureCount: null,
      peopleRowCount: null,
      matchesCsvPath,
      matchPeopleCsvPath,
      skippedFixtureIds: [],
      skippedExisting: true,
    };
  }

  const matchRows = [];
  const peopleRows = [];
  const skippedFixtureIds = [];

  for (const fixture of fixtureRows) {
    let teamsheetEntries = [];
    try {
      const teamsheet = await getTeamSheet(
        profile,
        fixture.fixtureId,
        fixture.homeTeam,
        fixture.awayTeam,
        { refresh }
      );
      teamsheetEntries = parseTeamsheet(teamsheet.text);
    } catch (error) {
      skippedFixtureIds.push(fixture.fixtureId);
    }

    const extracted = buildMatchExport({
      profile,
      seasonLabel,
      fixture,
      teamsheetEntries,
    });
    matchRows.push(extracted.matchRow);
    peopleRows.push(...extracted.peopleRows);
  }

  await writeCsv(matchesCsvPath, MATCH_COLUMNS, matchRows);
  await writeCsv(matchPeopleCsvPath, MATCH_PEOPLE_COLUMNS, peopleRows);

  return {
    profileId: profile.id,
    seasonId,
    seasonLabel,
    seasonSlug,
    competitionId,
    divisionName: effectiveDivisionName,
    divisionSlug,
    divisionDir,
    fixtureCount: fixtureRows.length,
    peopleRowCount: peopleRows.length,
    matchesCsvPath,
    matchPeopleCsvPath,
    skippedFixtureIds,
    skippedExisting: false,
  };
}

module.exports = {
  exportMatchPeople,
};
