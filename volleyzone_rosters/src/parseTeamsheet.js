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

      const isLibero = /\(Libero\)/i.test(text);
      const isCaptain = /\(Captain\)/i.test(text);
      const name = text
        .replace(/\((Libero|Captain|Coach)\)/gi, "")
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
      });
    }
  }

  return entries;
}

module.exports = {
  parseTeamsheet,
};
