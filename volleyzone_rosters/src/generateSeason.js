const path = require("path");
const { writeText } = require("./http");
const { seasonLabelToSlug } = require("./normalize");
const { generateDivision } = require("./generateDivision");
const { getProfileOutputDir } = require("./config");
const { discoverCurrentDivisions } = require("./discoverCurrentDivisions");

function buildTopLevelReadme({ profile, season, divisionsGenerated }) {
  const coverage = divisionsGenerated
    .slice()
    .sort((a, b) => a.divisionSlug.localeCompare(b.divisionSlug))
    .map(
      (division) =>
        `- \`${division.divisionSlug}/\`\n  Full ${season.label} ${division.divisionName} roster set completed`
    )
    .join("\n");

  return `# ${profile.competitionLabel} Rosters

This folder stores import-ready ${profile.competitionLabel} roster files for the \`game_scoring\` app.

## Current Season Index

The current-season division list below was extracted from the public competition dropdown on:

- \`${profile.fixtureResultsUrl}\`

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

async function generateCurrentSeason({ profile, refresh = false } = {}) {
  const discovery = await discoverCurrentDivisions(profile, { refresh });
  const currentSeason = discovery.currentSeason;
  if (!currentSeason) {
    throw new Error("Unable to determine current season from fixture page");
  }

  const divisions = discovery.divisions;
  const generated = [];
  for (const division of divisions) {
    generated.push(
      await generateDivision({
        profile,
        seasonId: currentSeason.seasonId,
        seasonLabel: currentSeason.label,
        competitionId: division.competitionId,
        divisionName: division.name,
        refresh,
      })
    );
  }

  const outputDir = getProfileOutputDir(profile);
  const seasonSlug = seasonLabelToSlug(currentSeason.label);
  const indexPath = path.join(outputDir, `divisions_${seasonSlug}.json`);
  const indexJson = {
    type: "volleyzone_division_index",
    profileId: profile.id,
    competitionLabel: profile.competitionLabel,
    seasonId: currentSeason.seasonId,
    seasonLabel: currentSeason.label,
    source: profile.fixtureResultsUrl,
    divisions,
  };
  await writeText(indexPath, `${JSON.stringify(indexJson, null, 2)}\n`);
  await writeText(
    path.join(outputDir, "README.md"),
    `${buildTopLevelReadme({
      profile,
      season: currentSeason,
      divisionsGenerated: generated,
    })}\n`
  );

  return {
    profileId: profile.id,
    season: currentSeason,
    divisionsGenerated: generated,
    indexPath,
  };
}

module.exports = {
  generateCurrentSeason,
};
