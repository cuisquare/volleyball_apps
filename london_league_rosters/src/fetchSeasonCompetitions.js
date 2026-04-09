function parseSeasonCompetitionsResponse(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      error: `Invalid JSON: ${error.message}`,
      raw: text,
    };
  }

  return {
    ok: true,
    groupsSeason: parsed.groups_season,
    competitions: parsed.competitions,
    raw: parsed,
  };
}

module.exports = {
  parseSeasonCompetitionsResponse,
};
