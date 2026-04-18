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

function parseOptionAttributes(rawAttributes) {
  const attributes = {};
  const attributeRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g;
  let match;
  while ((match = attributeRegex.exec(rawAttributes || "")) !== null) {
    attributes[match[1]] = decodeHtml(match[2]);
  }
  return attributes;
}

function extractSelectOptions(html, selectPattern) {
  const selectMatch = html.match(selectPattern);
  if (!selectMatch) {
    return [];
  }
  return parseOptionList(selectMatch[1]);
}

function parseOptionList(htmlFragment) {
  const options = [];
  const optionRegex = /<option\b([^>]*)>([\s\S]*?)<\/option>/g;
  let match;
  while ((match = optionRegex.exec(htmlFragment || "")) !== null) {
    const attributes = parseOptionAttributes(match[1]);
    options.push({
      value: attributes.value || "",
      label: stripTags(match[2]),
      selected: /selected/.test(match[1]),
      attributes,
    });
  }
  return options;
}

function parseSeasonOptions(html) {
  return extractSelectOptions(
    html,
    /<select name="select_season_fixture" id="select_season_fixture">([\s\S]*?)<\/select>/
  )
    .filter((option) => /^\d+$/.test(option.value))
    .map((option) => ({
      seasonId: Number(option.value),
      label: option.label,
      selected: option.selected,
    }));
}

function parseDivisionOptions(html) {
  return extractSelectOptions(
    html,
    /<select name="competition_field" id="select_comp">([\s\S]*?)<\/select>/
  )
    .filter((option) => /^\d+$/.test(option.value))
    .map((option) => ({
      competitionId: Number(option.value),
      name: option.label,
      selected: option.selected,
      attributes: option.attributes,
    }));
}

function parseDivisionOptionsFromFragment(htmlFragment) {
  return parseOptionList(htmlFragment)
    .filter((option) => /^\d+$/.test(option.value))
    .map((option) => ({
      competitionId: Number(option.value),
      name: option.label,
      selected: option.selected,
      attributes: option.attributes,
    }));
}

function parseCompetitionGroupOptions(html) {
  return extractSelectOptions(
    html,
    /<select name="competition_group" id="select_comp_group">([\s\S]*?)<\/select>/
  )
    .filter((option) => option.value !== "")
    .map((option) => ({
      groupId: option.value,
      name: option.label,
      selected: option.selected,
      seasonName: option.attributes["data-seasonname"] || "",
      seasonId: option.attributes["data-seasonid"] || "",
      attributes: option.attributes,
    }));
}

function parseCompetitionGroupOptionsFromFragment(fragment) {
  const fragments = Array.isArray(fragment) ? fragment : [fragment];
  return fragments
    .flatMap((item) => parseOptionList(typeof item === "string" ? item : ""))
    .filter((option) => option.value !== "")
    .map((option) => ({
      groupId: option.value,
      name: option.label,
      selected: option.selected,
      seasonName: option.attributes["data-seasonname"] || "",
      seasonId: option.attributes["data-seasonid"] || "",
      attributes: option.attributes,
    }));
}

module.exports = {
  parseSeasonOptions,
  parseDivisionOptions,
  parseDivisionOptionsFromFragment,
  parseCompetitionGroupOptions,
  parseCompetitionGroupOptionsFromFragment,
};
