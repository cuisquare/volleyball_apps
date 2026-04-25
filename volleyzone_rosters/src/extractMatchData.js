function roleToBenchLabel(role) {
  switch (role) {
    case "head_coach":
      return "Head Coach";
    case "coach":
      return "Coach";
    case "assistant_coach":
      return "Assistant Coach";
    case "bench_personnel":
      return "Bench Personnel";
    case "statistician":
      return "Statistician";
    default:
      return "";
  }
}

function buildSetScoreString(scores) {
  return Array.isArray(scores) ? scores.filter((score) => score != null).join("|") : "";
}

function buildMatchRow({
  profile,
  seasonLabel,
  fixture,
}) {
  return {
    profile: profile.id,
    season_id: fixture.seasonId,
    season_label: seasonLabel,
    competition_id: fixture.competitionId,
    competition_name: fixture.competitionName,
    fixture_id: fixture.fixtureId,
    match_date: fixture.matchDate,
    match_start_time: fixture.matchStartTime,
    fixture_status: fixture.fixtureStatus,
    home_team: fixture.homeTeam,
    away_team: fixture.awayTeam,
    home_club: fixture.homeClub,
    away_club: fixture.awayClub,
    home_club_id: fixture.homeClubId,
    away_club_id: fixture.awayClubId,
    home_sets_won: fixture.homeSetsWon,
    away_sets_won: fixture.awaySetsWon,
    home_set_scores: buildSetScoreString(fixture.homeSetScores),
    away_set_scores: buildSetScoreString(fixture.awaySetScores),
    final_score: fixture.finalScore,
    winning_team: fixture.winningTeam,
    venue: fixture.venue,
    first_referee: fixture.firstReferee,
    first_referee_id: fixture.firstRefereeId,
    second_referee: fixture.secondReferee,
    second_referee_id: fixture.secondRefereeId,
  };
}

function buildBasePersonRow(matchRow) {
  return {
    ...matchRow,
    person_name: "",
    person_role: "",
    team: "",
    club: "",
    club_id: "",
    home_or_away: "",
    shirt_number: "",
    is_captain: "",
    is_libero: "",
  };
}

function buildRefereeRows(matchRow) {
  const rows = [];
  if (matchRow.first_referee) {
    rows.push({
      ...buildBasePersonRow(matchRow),
      person_name: matchRow.first_referee,
      person_role: "first_referee",
    });
  }
  if (matchRow.second_referee) {
    rows.push({
      ...buildBasePersonRow(matchRow),
      person_name: matchRow.second_referee,
      person_role: "second_referee",
    });
  }
  return rows;
}

function buildTeamPeopleRows(matchRow, teamsheetEntries) {
  return teamsheetEntries.map((entry) => ({
    ...buildBasePersonRow(matchRow),
    person_name: entry.name,
    person_role: entry.role,
    team: entry.teamName,
    club:
      entry.teamName === matchRow.home_team
        ? matchRow.home_club
        : entry.teamName === matchRow.away_team
          ? matchRow.away_club
          : "",
    club_id:
      entry.teamName === matchRow.home_team
        ? matchRow.home_club_id
        : entry.teamName === matchRow.away_team
          ? matchRow.away_club_id
          : "",
    home_or_away: entry.teamName === matchRow.home_team ? "home" : entry.teamName === matchRow.away_team ? "away" : "",
    shirt_number: Number.isInteger(entry.shirtNumber) ? entry.shirtNumber : "",
    is_captain: entry.isPlayer ? String(Boolean(entry.isCaptain)) : "",
    is_libero: entry.isPlayer ? String(Boolean(entry.isLibero)) : "",
    bench_role_label: roleToBenchLabel(entry.role),
  }));
}

function buildMatchExport({
  profile,
  seasonLabel,
  fixture,
  teamsheetEntries,
}) {
  const matchRow = buildMatchRow({
    profile,
    seasonLabel,
    fixture,
  });

  return {
    matchRow,
    peopleRows: [
      ...buildTeamPeopleRows(matchRow, teamsheetEntries),
      ...buildRefereeRows(matchRow),
    ],
  };
}

const MATCH_COLUMNS = [
  "profile",
  "season_id",
  "season_label",
  "competition_id",
  "competition_name",
  "fixture_id",
  "match_date",
  "match_start_time",
  "fixture_status",
  "home_team",
  "away_team",
  "home_club",
  "away_club",
  "home_club_id",
  "away_club_id",
  "home_sets_won",
  "away_sets_won",
  "home_set_scores",
  "away_set_scores",
  "final_score",
  "winning_team",
  "venue",
  "first_referee",
  "first_referee_id",
  "second_referee",
  "second_referee_id",
];

const MATCH_PEOPLE_COLUMNS = [
  ...MATCH_COLUMNS,
  "person_name",
  "person_role",
  "team",
  "club",
  "club_id",
  "home_or_away",
  "shirt_number",
  "is_captain",
  "is_libero",
  "bench_role_label",
];

module.exports = {
  buildMatchExport,
  MATCH_COLUMNS,
  MATCH_PEOPLE_COLUMNS,
};
