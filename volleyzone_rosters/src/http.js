const fs = require("fs/promises");
const path = require("path");
const {
  AJAX_URL,
  getProfileCacheDirs,
} = require("./config");

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeText(filePath, text) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, text, "utf8");
}

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

async function getFixtureResultsPage(profile, { refresh = false } = {}) {
  const cacheDirs = getProfileCacheDirs(profile);
  const cachePath = path.join(
    cacheDirs.pages,
    `fixture_results_${profile.cacheSlug || profile.id}.html`
  );
  if (!refresh) {
    const cached = await readIfExists(cachePath);
    if (cached) {
      return { text: cached, cachePath, fromCache: true };
    }
  }
  const text = await fetchText(profile.fixtureResultsUrl);
  await writeText(cachePath, text);
  return { text, cachePath, fromCache: false };
}

async function getSeasonCompetitions(
  profile,
  seasonId,
  { refresh = false } = {}
) {
  const cacheDirs = getProfileCacheDirs(profile);
  const cachePath = path.join(cacheDirs.seasons, `season_${seasonId}.json`);
  if (!refresh) {
    const cached = await readIfExists(cachePath);
    if (cached) {
      return { text: cached, cachePath, fromCache: true };
    }
  }

  const body = new URLSearchParams({
    seasonID: String(seasonId),
    pageTitle: profile.pageTitle,
    lastSegment: profile.lastSegment,
  });

  const text = await fetchText(`${AJAX_URL}?action=fetch_season_competitions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });

  await writeText(cachePath, text);
  return { text, cachePath, fromCache: false };
}

async function getFixturesByCompetition(
  profile,
  seasonId,
  competitionId,
  { refresh = false } = {}
) {
  const cacheDirs = getProfileCacheDirs(profile);
  const cachePath = path.join(
    cacheDirs.divisions,
    `season_${seasonId}_competition_${competitionId}.json`
  );
  if (!refresh) {
    const cached = await readIfExists(cachePath);
    if (cached) {
      return { text: cached, cachePath, fromCache: true };
    }
  }

  const body = new URLSearchParams({
    seasonidgrp: String(seasonId),
    fix_compID: String(competitionId),
    pageTitle: profile.pageTitle,
    userId: profile.userId,
    lastSegment: profile.lastSegment,
  });

  const text = await fetchText(`${AJAX_URL}?action=fetch_fixture_by_competition`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });

  await writeText(cachePath, text);
  return { text, cachePath, fromCache: false };
}

async function getFixturesByCompetitionGroup(
  profile,
  seasonId,
  fixCompgrpID,
  { refresh = false, extraFields = {} } = {}
) {
  const cacheDirs = getProfileCacheDirs(profile);
  const safeGroupId = String(fixCompgrpID).replace(/[^a-zA-Z0-9,_-]+/g, "_");
  const cachePath = path.join(
    cacheDirs.divisions,
    `season_${seasonId}_group_${safeGroupId}.html`
  );
  if (!refresh) {
    const cached = await readIfExists(cachePath);
    if (cached) {
      return { text: cached, cachePath, fromCache: true };
    }
  }

  const body = new URLSearchParams({
    seasonidgrp: String(seasonId),
    fix_compgrpID: String(fixCompgrpID),
    pageTitle: profile.pageTitle,
    userId: profile.userId,
    lastSegment: profile.lastSegment,
    ...Object.fromEntries(
      Object.entries(extraFields || {}).map(([key, value]) => [key, String(value)])
    ),
  });

  const text = await fetchText(
    `${AJAX_URL}?action=fetch_fixture_by_competitiongrp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body,
    }
  );

  await writeText(cachePath, text);
  return { text, cachePath, fromCache: false };
}

async function getSquadPage(profile, url, cacheKey, { refresh = false } = {}) {
  const cacheDirs = getProfileCacheDirs(profile);
  const cachePath = path.join(cacheDirs.squads, `${cacheKey}.html`);
  if (!refresh) {
    const cached = await readIfExists(cachePath);
    if (cached) {
      return { text: cached, cachePath, fromCache: true };
    }
  }
  const text = await fetchText(url);
  await writeText(cachePath, text);
  return { text, cachePath, fromCache: false };
}

async function getTeamSheet(
  profile,
  fixtureId,
  homeTeam,
  awayTeam,
  { refresh = false } = {}
) {
  const cacheDirs = getProfileCacheDirs(profile);
  const cachePath = path.join(cacheDirs.teamsheets, `fixture_${fixtureId}.html`);
  if (!refresh) {
    const cached = await readIfExists(cachePath);
    if (cached) {
      return { text: cached, cachePath, fromCache: true };
    }
  }

  const body = new URLSearchParams({
    action: "fixtureInformation",
    hometeam: homeTeam,
    awayteam: awayTeam,
    id: String(fixtureId),
    pageTitle: profile.pageTitle,
  });

  const text = await fetchText(AJAX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });

  await writeText(cachePath, text);
  return { text, cachePath, fromCache: false };
}

module.exports = {
  ensureDir,
  writeText,
  getFixtureResultsPage,
  getSeasonCompetitions,
  getFixturesByCompetition,
  getFixturesByCompetitionGroup,
  getSquadPage,
  getTeamSheet,
};
