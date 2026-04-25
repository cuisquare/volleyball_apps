function decodeHtml(text) {
  return text
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function cleanText(text) {
  return decodeHtml(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractTags(text) {
  const tags = [];
  const regex = /\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const values = cleanText(match[1])
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    tags.push(...values);
  }
  return tags;
}

function classifyRole(tags, shirtNumber) {
  const lowered = tags.map((tag) => tag.toLowerCase());
  if (lowered.includes("head coach")) {
    return "head_coach";
  }
  if (lowered.includes("coach")) {
    return "coach";
  }
  if (lowered.includes("assistant coach")) {
    return "assistant_coach";
  }
  if (lowered.includes("bench personnel")) {
    return "bench_personnel";
  }
  if (lowered.includes("statistician")) {
    return "statistician";
  }
  if (Number.isInteger(shirtNumber)) {
    return "player";
  }
  return "staff";
}

function parseTeamsheet(html) {
  const entries = [];
  const sectionRegex =
    /<li class="colored(?: away)?">[\s\S]*?<\/span>(.*?)<\/li>\s*<\/ul>\s*<ol class="name_player left_main_team"[^>]*>([\s\S]*?)<\/ol>/g;

  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(html)) !== null) {
    const teamName = cleanText(sectionMatch[1]);
    const body = sectionMatch[2];
    const itemRegex = /<li class="topd(?: first_15)?">(.*?)<\/li>/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(body)) !== null) {
      const inner = itemMatch[1].replace(/\s+/g, " ").trim();
      const numberMatch = inner.match(/<b>(.*?)<\/b>/);
      let shirtNumber = null;
      if (numberMatch && /^\d+$/.test(cleanText(numberMatch[1]))) {
        shirtNumber = Number(cleanText(numberMatch[1]));
      }

      let text = inner.replace(/<b>.*?<\/b>/, "").trim();
      text = cleanText(text || (numberMatch ? numberMatch[1] : ""));
      if (!text) {
        continue;
      }

      const tags = extractTags(text);
      const isLibero = tags.some((tag) => /^libero$/i.test(tag));
      const isCaptain = tags.some((tag) => /^captain$/i.test(tag));
      const role = classifyRole(tags, shirtNumber);
      const name = text
        .replace(/\([^)]*\)/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!name) {
        continue;
      }

      entries.push({
        teamName,
        name,
        shirtNumber,
        isLibero,
        isCaptain,
        tags,
        role,
        isPlayer: role === "player",
      });
    }
  }

  return entries;
}

module.exports = {
  parseTeamsheet,
};
