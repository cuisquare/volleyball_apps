const fs = require("fs/promises");
const path = require("path");
const {
  PAGE_CACHE_DIR,
  SEASON_CACHE_DIR,
  DIVISION_CACHE_DIR,
  SQUAD_CACHE_DIR,
  TEAMSHEET_CACHE_DIR,
  FIXTURE_RESULTS_URL,
  AJAX_URL,
  PAGE_TITLE,
  LAST_SEGMENT,
  USER_ID,
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

async function getFixtureResultsPage({ refresh = false } = {}) {
  const cachePath = path.join(PAGE_CACHE_DIR, "fixture_results_lva.html");
  if (!refresh) {
    const cached = await readIfExists(cachePath);
    if (cached) {
      return { text: cached, cachePath, fromCache: true };
    }
  }
  const text = await fetchText(FIXTURE_RESULTS_URL);
  await writeText(cachePath, text);
  return { text, cachePath, fromCache: false };
}

async function getSeasonCompetitions(seasonId, { refresh = false } = {}) {
  const cachePath = path.join(SEASON_CACHE_DIR, `season_${seasonId}.json`);
  if (!refresh) {
    const cached = await readIfExists(cachePath);
    if (cached) {
      return { text: cached, cachePath, fromCache: true };
    }
  }

  const body = new URLSearchParams({
    seasonID: String(seasonId),
    pageTitle: PAGE_TITLE,
    lastSegment: LAST_SEGMENT,
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
  seasonId,
  competitionId,
  { refresh = false } = {}
) {
  const cachePath = path.join(
    DIVISION_CACHE_DIR,
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
    pageTitle: PAGE_TITLE,
    userId: USER_ID,
    lastSegment: LAST_SEGMENT,
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

async function getSquadPage(url, cacheKey, { refresh = false } = {}) {
  const cachePath = path.join(SQUAD_CACHE_DIR, `${cacheKey}.html`);
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
  fixtureId,
  homeTeam,
  awayTeam,
  { refresh = false } = {}
) {
  const cachePath = path.join(TEAMSHEET_CACHE_DIR, `fixture_${fixtureId}.html`);
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
    pageTitle: PAGE_TITLE,
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
  getSquadPage,
  getTeamSheet,
};
