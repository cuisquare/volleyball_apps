function parseFixturesByCompetitionResponse(text) {
  const parsed = JSON.parse(text);
  let debugPayload = null;
  try {
    debugPayload = parsed.debug ? JSON.parse(parsed.debug) : null;
  } catch (error) {
    debugPayload = null;
  }

  const fixtureRows =
    debugPayload && debugPayload.data && Array.isArray(debugPayload.data.fixtures)
      ? debugPayload.data.fixtures.map((fixture) => ({
          fixtureId: Number(fixture.fixtureId),
          seasonId: Number(fixture.seasonId),
          competitionId: Number(fixture.competitionId),
          competitionName: fixture.competitionName,
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeTeamId: Number(fixture.homeTeamId),
          awayTeamId: Number(fixture.awayTeamId),
          fixtureStatus: fixture.fixtureStatus,
        }))
      : [];

  return {
    fixturesHtml: parsed.fixtures || "",
    teamsHtml: parsed.teams || "",
    datesHtml: parsed.dates || "",
    fixtureRows,
  };
}

module.exports = {
  parseFixturesByCompetitionResponse,
};
