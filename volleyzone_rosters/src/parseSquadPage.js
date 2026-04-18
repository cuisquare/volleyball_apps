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

function parseSquadPage(html) {
  const teamNameMatch = html.match(/<h4>\s*(.*?)\s*<\/h4>/s);
  const teamName = teamNameMatch ? cleanText(teamNameMatch[1]) : "";

  const coachMatch = html.match(
    /<td><b>Coach Role<\/b><\/td>\s*<td>(.*?)<\/td>/s
  );
  const coach = coachMatch ? cleanText(coachMatch[1]) : null;

  const squadStart = html.indexOf('<div class="team_panel_squad_container">');
  const squadHtml = squadStart >= 0 ? html.slice(squadStart) : html;

  const profileRegex =
    /<div class="profile_card">[\s\S]*?<span class="fname">(.*?)<\/span>\s*<span class="sname">(.*?)<\/span>\s*<span class="player_id">(.*?)<\/span>/g;

  const players = [];
  let match;
  while ((match = profileRegex.exec(squadHtml)) !== null) {
    players.push({
      name: cleanText(`${match[1]} ${match[2]}`),
      regNumber: cleanText(match[3]),
    });
  }

  return {
    teamName,
    coach,
    players,
  };
}

module.exports = {
  parseSquadPage,
};
