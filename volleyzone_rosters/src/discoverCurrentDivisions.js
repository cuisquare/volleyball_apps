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

async function discoverCurrentDivisions(
  profile,
  { refresh = false, mode = profile.defaultDivisionMode || "raw" } = {}
) {
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
      throw new Error(
        "Unable to determine current season for filtered division discovery"
      );
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

  return {
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
  };
}

module.exports = {
  discoverCurrentDivisions,
};
