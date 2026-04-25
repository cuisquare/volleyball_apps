const { getSeasonCompetitions, getFixturesByCompetitionGroup } = require("./http");
const {
  parseDivisionOptionsFromFragment,
  parseCompetitionGroupOptionsFromFragment,
} = require("./parseFixtureResults");
const {
  parseSeasonCompetitionsResponse,
} = require("./fetchSeasonCompetitions");

async function discoverSeasonDivisions(
  profile,
  seasonId,
  { refresh = false, mode = profile.defaultDivisionMode || "raw" } = {}
) {
  const seasonResponse = await getSeasonCompetitions(profile, seasonId, {
    refresh,
  });
  const parsedSeason = parseSeasonCompetitionsResponse(seasonResponse.text);
  if (!parsedSeason.ok) {
    throw new Error(
      `Unable to parse season competition response for season ${seasonId}`
    );
  }

  let divisions = [];
  let groups = [];
  let filtered = false;
  let divisionSource = "season_competitions";
  let groupCachePath = null;
  let groupFromCache = null;

  if (mode === "filtered") {
    if (!profile.groupFilter) {
      throw new Error(
        `Profile '${profile.id}' does not define filtered division discovery.`
      );
    }
    groups = parseCompetitionGroupOptionsFromFragment(parsedSeason.groupsSeason);

    const matchingGroup = groups.find((group) =>
      (group.seasonName || "")
        .toLowerCase()
        .includes(profile.groupFilter.seasonNameContains.toLowerCase())
    );

    if (!matchingGroup) {
      throw new Error(
        `Could not find a competition group matching '${profile.groupFilter.seasonNameContains}' for profile '${profile.id}' in season ${seasonId}.`
      );
    }

    const fixCompgrpID = profile.groupFilter.buildFixCompgrpID({
      selectedGroupId: matchingGroup.groupId,
      seasonId,
      profile,
    });

    const filteredResponse = await getFixturesByCompetitionGroup(
      profile,
      seasonId,
      fixCompgrpID,
      { refresh }
    );
    divisions = parseDivisionOptionsFromFragment(filteredResponse.text);
    filtered = true;
    divisionSource = "season_competition_group_filtered";
    groupCachePath = filteredResponse.cachePath;
    groupFromCache = filteredResponse.fromCache;
  } else {
    divisions = parseDivisionOptionsFromFragment(parsedSeason.competitions);
    groups = parseCompetitionGroupOptionsFromFragment(parsedSeason.groupsSeason);
  }

  return {
    profile,
    seasonId,
    source: divisionSource,
    mode,
    cachePath: seasonResponse.cachePath,
    fromCache: seasonResponse.fromCache,
    groups,
    filtered,
    groupCachePath,
    groupFromCache,
    divisions,
  };
}

module.exports = {
  discoverSeasonDivisions,
};
