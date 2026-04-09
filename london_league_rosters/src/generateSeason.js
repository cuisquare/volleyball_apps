const path = require("path");
const { getFixtureResultsPage, writeText } = require("./http");
const {
  parseSeasonOptions,
  parseDivisionOptions,
} = require("./parseFixtureResults");
const { seasonLabelToSlug } = require("./normalize");
const { generateDivision } = require("./generateDivision");
const { OUTPUT_DIR } = require("./config");

function buildTopLevelReadme({ season, divisionsGenerated }) {
  const coverage = divisionsGenerated
    .slice()
    .sort((a, b) => a.divisionSlug.localeCompare(b.divisionSlug))
    .map(
      (division) =>
        `- \`${division.divisionSlug}/\`\n  Full ${season.label} ${division.divisionName} roster set completed`
    )
    .join("\n");

  return `# London League Rosters

This folder stores import-ready London League roster files for the \`game_scoring\` app.

## Current Season Index

The current-season division list below was extracted from the public competition dropdown on:

- \`https://competitions.volleyzone.co.uk/fixture-and-results/lva/\`

Season id observed on that page:

- \`${season.seasonId}\` for \`${season.label}\`

## Current Coverage

${coverage}

## Extraction Approach

The practical extraction flow is:

1. Read the season and competition ids from the public \`fixture-and-results\` page
2. Use the division fixture JSON endpoint to recover fixture ids, team ids, and team names
3. Use each team's public squad page for the broader eligible-player pool
4. Use published match teamsheets from the same division to recover shirt numbers, libero/captain hints, and coach names where available

That keeps the squad page as the source for eligibility, while using teamsheets only to improve matchday detail.
`;
}

async function generateCurrentSeason({ refresh = false } = {}) {
  const fixturePage = await getFixtureResultsPage({ refresh });
  const seasons = parseSeasonOptions(fixturePage.text);
  const currentSeason = seasons.find((season) => season.selected);
  if (!currentSeason) {
    throw new Error("Unable to determine current season from fixture page");
  }

  const divisions = parseDivisionOptions(fixturePage.text);
  const generated = [];
  for (const division of divisions) {
    generated.push(
      await generateDivision({
        seasonId: currentSeason.seasonId,
        seasonLabel: currentSeason.label,
        competitionId: division.competitionId,
        divisionName: division.name,
        refresh,
      })
    );
  }

  const seasonSlug = seasonLabelToSlug(currentSeason.label);
  const indexPath = path.join(OUTPUT_DIR, `divisions_${seasonSlug}.json`);
  const indexJson = {
    type: "london_league_division_index",
    seasonId: currentSeason.seasonId,
    seasonLabel: currentSeason.label,
    source: "https://competitions.volleyzone.co.uk/fixture-and-results/lva/",
    divisions,
  };
  await writeText(indexPath, `${JSON.stringify(indexJson, null, 2)}\n`);
  await writeText(
    path.join(OUTPUT_DIR, "README.md"),
    `${buildTopLevelReadme({ season: currentSeason, divisionsGenerated: generated })}\n`
  );

  return {
    season: currentSeason,
    divisionsGenerated: generated,
    indexPath,
  };
}

module.exports = {
  generateCurrentSeason,
};
