function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatLondonDate(unixSeconds) {
  if (!Number.isFinite(unixSeconds)) {
    return "";
  }
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date(unixSeconds * 1000));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.year && values.month && values.day
    ? `${values.year}-${values.month}-${values.day}`
    : "";
}

function parseMatchStartTime(fixtureComment) {
  const match = String(fixtureComment || "").match(/Match Start:\s*([0-9]{1,2}:[0-9]{2})/i);
  return match ? match[1] : "";
}

function getOfficialByRole(fixture, roleName) {
  const target = String(roleName || "").toLowerCase();
  const matchOfficials = fixture.matchOfficials || {};
  for (const value of Object.values(matchOfficials)) {
    if (
      value &&
      String(value.role || "").toLowerCase() === target
    ) {
      return {
        name: value.name || "",
        refId: value.refID || "",
      };
    }
  }

  const officials = fixture.officials || {};
  for (const [role, name] of Object.entries(officials)) {
    if (String(role).toLowerCase() === target) {
      return {
        name: name || "",
        refId: "",
      };
    }
  }

  return {
    name: "",
    refId: "",
  };
}

function parseSetScores(sideScores) {
  if (!sideScores || typeof sideScores !== "object") {
    return [];
  }
  const scores = [];
  for (let setNumber = 1; setNumber <= 5; setNumber += 1) {
    const value = sideScores[String(setNumber)];
    if (value === "" || value == null) {
      continue;
    }
    scores.push(toNumber(value));
  }
  return scores;
}

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
          homeClub: fixture.homeClub || "",
          awayClub: fixture.awayClub || "",
          homeClubId: toNumber(fixture.homeClubId),
          awayClubId: toNumber(fixture.awayClubId),
          fixtureStatus: fixture.fixtureStatus,
          fixtureDate: toNumber(fixture.fixtureDate),
          matchDate: formatLondonDate(toNumber(fixture.fixtureDate)),
          matchStartTime: parseMatchStartTime(fixture.fixtureComment),
          venue: fixture.venue || "",
          homeSetsWon: toNumber(fixture?.metaData?.scores?.home?.goals),
          awaySetsWon: toNumber(fixture?.metaData?.scores?.away?.goals),
          homeSetScores: parseSetScores(fixture?.metaData?.scores?.home),
          awaySetScores: parseSetScores(fixture?.metaData?.scores?.away),
          homeResult: fixture.homeResult || "",
          awayResult: fixture.awayResult || "",
          winningTeam:
            fixture.homeResult === "win"
              ? fixture.homeTeam
              : fixture.awayResult === "win"
                ? fixture.awayTeam
                : "",
          finalScore: `${fixture?.metaData?.scores?.home?.goals || ""}-${fixture?.metaData?.scores?.away?.goals || ""}`,
          firstReferee: getOfficialByRole(fixture, "1st Referee").name,
          firstRefereeId: getOfficialByRole(fixture, "1st Referee").refId,
          secondReferee: getOfficialByRole(fixture, "2nd Referee").name,
          secondRefereeId: getOfficialByRole(fixture, "2nd Referee").refId,
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
