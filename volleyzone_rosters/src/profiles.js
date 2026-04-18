const PROFILES = {
  london_league: {
    id: "london_league",
    label: "London League",
    competitionLabel: "London League",
    fixtureResultsUrl: "https://competitions.volleyzone.co.uk/fixture-and-results/lva/",
    lastSegment: "lva",
    pageTitle: "Fixture and Results",
    userId: "298568",
    outputSlug: "london_league",
    cacheSlug: "lva",
    defaultDivisionMode: "raw",
  },
  nvl: {
    id: "nvl",
    label: "NVL",
    competitionLabel: "Volleyball England NVL",
    fixtureResultsUrl: "https://competitions.volleyzone.co.uk/fixture-and-results/nvl/",
    lastSegment: "nvl",
    pageTitle: "Fixture and Results",
    userId: "279580",
    outputSlug: "nvl",
    cacheSlug: "nvl",
    defaultDivisionMode: "filtered",
    groupFilter: {
      seasonNameContains: "nvl",
      buildFixCompgrpID: ({ selectedGroupId }) => `3805,${selectedGroupId}`,
    },
  },
  ve_nvl: {
    id: "ve_nvl",
    label: "Volleyball England NVL",
    competitionLabel: "Volleyball England NVL",
    fixtureResultsUrl: "https://competitions.volleyzone.co.uk/fixture-and-results/nvl/",
    lastSegment: "nvl",
    pageTitle: "Fixture and Results",
    userId: "279580",
    outputSlug: "ve_nvl",
    cacheSlug: "nvl",
    defaultDivisionMode: "filtered",
    groupFilter: {
      seasonNameContains: "nvl",
      buildFixCompgrpID: ({ selectedGroupId }) => `3805,${selectedGroupId}`,
    },
  },
  ve_super_league: {
    id: "ve_super_league",
    label: "Volleyball England Super League",
    competitionLabel: "Volleyball England Super League",
    fixtureResultsUrl: "https://competitions.volleyzone.co.uk/fixture-and-results/super-league/",
    lastSegment: "super-league",
    pageTitle: "Fixture and Results",
    userId: "279580",
    outputSlug: "ve_super_league",
    cacheSlug: "super-league",
    defaultDivisionMode: "filtered",
    groupFilter: {
      seasonNameContains: "super-league",
      buildFixCompgrpID: ({ selectedGroupId }) => String(selectedGroupId),
    },
  },
};

function getProfile(profileId = "london_league") {
  const profile = PROFILES[profileId];
  if (!profile) {
    throw new Error(
      `Unknown profile '${profileId}'. Available profiles: ${Object.keys(PROFILES).join(", ")}`
    );
  }
  return profile;
}

function listProfiles() {
  return Object.values(PROFILES).map((profile) => ({
    id: profile.id,
    label: profile.label,
    fixtureResultsUrl: profile.fixtureResultsUrl,
  }));
}

module.exports = {
  PROFILES,
  getProfile,
  listProfiles,
};
