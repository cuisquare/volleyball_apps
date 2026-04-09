const path = require("path");
const {
  getFixturesByCompetition,
  getSquadPage,
  getTeamSheet,
  ensureDir,
  writeText,
} = require("./http");
const { parseFixturesByCompetitionResponse } = require("./fixturesByCompetition");
const { parseSquadPage } = require("./parseSquadPage");
const { parseTeamsheet } = require("./parseTeamsheet");
const {
  buildSquadUrl,
  buildObservedMap,
  buildDivisionSlug,
  mergeSquadAndObservation,
  normalizeName,
  slugify,
} = require("./normalize");
const { OUTPUT_DIR } = require("./config");

function buildCoverageLine({ teamName, matchedShirtCount, squadCount }) {
  return `- \`${teamName}\`: ${matchedShirtCount}/${squadCount} squad players matched to published shirt numbers across the sampled teamsheets`;
}

async function generateDivision({
  seasonId,
  seasonLabel,
  competitionId,
  divisionName,
  refresh = false,
}) {
  const fixtureResponse = await getFixturesByCompetition(seasonId, competitionId, {
    refresh,
  });
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
  const divisionDir = path.join(OUTPUT_DIR, divisionSlug);
  await ensureDir(divisionDir);

  const teamSamples = new Map();
  for (const row of fixtureRows) {
    if (!teamSamples.has(row.homeTeamId)) {
      teamSamples.set(row.homeTeamId, {
        teamName: row.homeTeam,
        teamId: row.homeTeamId,
        fixtureId: row.fixtureId,
        side: "home",
      });
    }
    if (!teamSamples.has(row.awayTeamId)) {
      teamSamples.set(row.awayTeamId, {
        teamName: row.awayTeam,
        teamId: row.awayTeamId,
        fixtureId: row.fixtureId,
        side: "away",
      });
    }
  }

  const squadInfos = new Map();
  for (const sample of teamSamples.values()) {
    const squadUrl = buildSquadUrl({
      fixtureId: sample.fixtureId,
      teamId: sample.teamId,
      seasonId,
      side: sample.side,
    });
    const cacheKey = `${seasonId}_${competitionId}_${sample.teamId}`;
    const squadResponse = await getSquadPage(squadUrl, cacheKey, { refresh });
    squadInfos.set(sample.teamName, {
      ...parseSquadPage(squadResponse.text),
      squadUrl,
    });
  }

  const allTeamsheetEntries = [];
  for (const row of fixtureRows) {
    try {
      const teamsheet = await getTeamSheet(row.fixtureId, row.homeTeam, row.awayTeam, {
        refresh,
      });
      allTeamsheetEntries.push(...parseTeamsheet(teamsheet.text));
    } catch (error) {
      // Keep going; some fixtures may not expose a teamsheet fragment.
    }
  }

  const teamNames = Array.from(squadInfos.keys()).sort();
  const coverageLines = [];
  const squadLines = [];

  for (const teamName of teamNames) {
    const squadInfo = squadInfos.get(teamName);
    const observedMap = buildObservedMap(allTeamsheetEntries, teamName);
    const roster = mergeSquadAndObservation({ squadInfo, observedMap });
    const fileName = `${slugify(teamName)}.json`;
    const outPath = path.join(divisionDir, fileName);
    const json = {
      type: "volleyball_team_roster",
      version: 2,
      exportedAt: "2026-04-09T00:00:00.000Z",
      teamName,
      roster,
    };
    await writeText(outPath, `${JSON.stringify(json, null, 2)}\n`);

    let matchedShirtCount = 0;
    for (const player of squadInfo.players) {
      const observed = observedMap.get(normalizeName(player.name));
      if (observed && observed.shirtNumbers.length > 0) {
        matchedShirtCount += 1;
      }
    }

    coverageLines.push(
      buildCoverageLine({
        teamName,
        matchedShirtCount,
        squadCount: squadInfo.players.length,
      })
    );
    squadLines.push(`- \`${teamName}\`: \`${squadInfo.squadUrl}\``);
  }

  const fixtureLines = fixtureRows.map(
    (row) => `- \`${row.homeTeam} vs ${row.awayTeam}\`: fixture \`${row.fixtureId}\``
  );

  const readme = `# London League ${effectiveDivisionName} Rosters

These roster files are prepared for import into the \`game_scoring\` app.

This folder covers the ${seasonLabel} London League ${effectiveDivisionName} team set recovered from the public fixtures/results data:

${teamNames.map((teamName) => `- \`${teamName}\``).join("\n")}

## Source basis

- Season id: \`${seasonId}\`
- Competition id: \`${competitionId}\`
- Division source page: \`https://competitions.volleyzone.co.uk/fixture-and-results/lva/\`

Full eligible squad pages used:

${squadLines.join("\n")}

## Teamsheets sampled

${fixtureLines.join("\n")}

## Interpretation used here

- The eligible-player pool comes from the public squad page, not from a single teamsheet
- Players visible on the sampled teamsheets for that club are marked \`rostered: true\`
- Where a sampled teamsheet exposed a shirt number, that value is preferred
- Where a sampled teamsheet omitted numbers or where a player never appeared in the sampled teamsheet set, a unique placeholder positive number is used for import convenience

## Shirt-number coverage

${coverageLines.join("\n")}
`;

  await writeText(path.join(divisionDir, "README.md"), `${readme}\n`);

  return {
    divisionName: effectiveDivisionName,
    divisionSlug,
    divisionDir,
    teamCount: teamNames.length,
    competitionId,
    seasonId,
  };
}

module.exports = {
  generateDivision,
};
