const fs = require("fs/promises");
const path = require("path");
const {
  PAGE_CACHE_DIR,
  SEASON_CACHE_DIR,
  FIXTURE_RESULTS_URL,
  AJAX_URL,
  PAGE_TITLE,
  LAST_SEGMENT,
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
  getFixtureResultsPage,
  getSeasonCompetitions,
};
