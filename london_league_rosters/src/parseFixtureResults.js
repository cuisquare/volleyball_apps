function decodeHtml(text) {
  return text
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(text) {
  return decodeHtml(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseSeasonOptions(html) {
  const seasons = [];
  const selectMatch = html.match(
    /<select name="select_season_fixture" id="select_season_fixture">([\s\S]*?)<\/select>/
  );
  if (!selectMatch) {
    return seasons;
  }

  const optionRegex = /<option value="(\d+)"([^>]*)>([\s\S]*?)<\/option>/g;
  let match;
  while ((match = optionRegex.exec(selectMatch[1])) !== null) {
    seasons.push({
      seasonId: Number(match[1]),
      label: stripTags(match[3]),
      selected: /selected/.test(match[2]),
    });
  }
  return seasons;
}

function parseDivisionOptions(html) {
  const divisions = [];
  const selectMatch = html.match(
    /<select name="competition_field" id="select_comp">([\s\S]*?)<\/select>/
  );
  if (!selectMatch) {
    return divisions;
  }

  const optionRegex = /<option\s+value="(\d+)"[\s\S]*?>([\s\S]*?)<\/option>/g;
  let match;
  while ((match = optionRegex.exec(selectMatch[1])) !== null) {
    divisions.push({
      competitionId: Number(match[1]),
      name: stripTags(match[2]),
    });
  }
  return divisions;
}

module.exports = {
  parseSeasonOptions,
  parseDivisionOptions,
};
