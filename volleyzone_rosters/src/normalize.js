function stripDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeName(name) {
  return stripDiacritics(name || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/women's/g, "women")
    .replace(/men's/g, "men")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function seasonLabelToSlug(label) {
  return (label || "")
    .toLowerCase()
    .replace(/[^0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildSquadUrl({ fixtureId, teamId, seasonId, side }) {
  return `https://competitions.volleyzone.co.uk/wp-single-team-details?fixture_id=${fixtureId}&team_id=${teamId}&season_id=${seasonId}&team=${side}`;
}

function buildDivisionSlug(divisionName) {
  const lower = (divisionName || "").toLowerCase();
  const premierMatch = lower.match(/^(men|women)'s premier division$/);
  if (premierMatch) {
    return `${premierMatch[1]}_premier`;
  }
  const divisionMatch = lower.match(/^(men|women)'s division ([0-9a-z]+)$/);
  if (divisionMatch) {
    return `${divisionMatch[1]}_${divisionMatch[2].toLowerCase()}`;
  }
  return slugify(divisionName);
}

function assignPlaceholderNumbers(rosterEntries) {
  const used = new Set();
  for (const entry of rosterEntries) {
    if (entry.isPlayer && Number.isInteger(entry.shirtNumber)) {
      used.add(entry.shirtNumber);
    }
  }

  let next = 1;
  for (const entry of rosterEntries) {
    if (entry.isPlayer && !Number.isInteger(entry.shirtNumber)) {
      while (used.has(next)) {
        next += 1;
      }
      entry.shirtNumber = next;
      used.add(next);
      next += 1;
    }
  }
}

function mergeSquadAndObservation({ squadInfo, observedMap }) {
  const roster = [];
  for (const player of squadInfo.players) {
    const key = normalizeName(player.name);
    const observed = observedMap.get(key) || null;
    roster.push({
      name: player.name,
      shirtNumber:
        observed && observed.shirtNumbers.length > 0
          ? observed.shirtNumbers[0]
          : null,
      regNumber: player.regNumber,
      isPlayer: true,
      rostered: Boolean(observed),
      isLibero: Boolean(observed && observed.isLibero),
      isCaptain: Boolean(observed && observed.isCaptain),
      benchRole: "",
    });
  }

  assignPlaceholderNumbers(roster);

  if (squadInfo.coach) {
    roster.push({
      name: squadInfo.coach,
      shirtNumber: null,
      regNumber: "",
      isPlayer: false,
      rostered: true,
      isLibero: false,
      isCaptain: false,
      benchRole: "Coach",
    });
  }

  return roster;
}

function buildObservedMap(entries, teamName) {
  const map = new Map();
  for (const entry of entries) {
    if (entry.teamName !== teamName) {
      continue;
    }
    if (!entry.isPlayer) {
      continue;
    }
    const key = normalizeName(entry.name);
    if (!map.has(key)) {
      map.set(key, {
        name: entry.name,
        shirtNumbers: [],
        isLibero: false,
        isCaptain: false,
        seenCount: 0,
      });
    }
    const record = map.get(key);
    if (
      Number.isInteger(entry.shirtNumber) &&
      !record.shirtNumbers.includes(entry.shirtNumber)
    ) {
      record.shirtNumbers.push(entry.shirtNumber);
    }
    if (entry.isLibero) {
      record.isLibero = true;
    }
    if (entry.isCaptain) {
      record.isCaptain = true;
    }
    record.seenCount += 1;
  }
  return map;
}

module.exports = {
  normalizeName,
  slugify,
  seasonLabelToSlug,
  buildSquadUrl,
  buildDivisionSlug,
  mergeSquadAndObservation,
  buildObservedMap,
};
