import Rules from './Rules.js';

const SNAPSHOT_VERSION = 1;

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function sanitizeSavedRuleProfiles(rawProfiles) {
    if (!Array.isArray(rawProfiles)) {
        return [];
    }
    const sanitized = [];
    for (const profile of rawProfiles) {
        if (!profile || typeof profile.id !== 'string' || typeof profile.name !== 'string') {
            continue;
        }
        if (!profile.values || typeof profile.values !== 'object') {
            continue;
        }
        sanitized.push({
            id: profile.id,
            name: profile.name,
            values: deepClone(profile.values)
        });
    }
    return sanitized;
}

function ensureObject(rawValue, fallback = {}) {
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
        return deepClone(fallback);
    }
    return rawValue;
}

function ensureHistory(rawHistory) {
    const history = ensureObject(rawHistory, {});
    return {
        version: typeof history.version === 'number' ? history.version : 1,
        events: Array.isArray(history.events) ? deepClone(history.events) : [],
        sets: Array.isArray(history.sets) ? deepClone(history.sets) : [],
        placeholders: ensureObject(history.placeholders, {
            substitutions: [],
            penalties: [],
            setTimes: []
        })
    };
}

function isValidHomeAway(value) {
    return value === 'home' || value === 'away';
}

function isValidTeamId(value) {
    return value === 'teamA' || value === 'teamB';
}

export function buildSnapshot({ mygame, setupState, savedRuleProfiles }) {
    return {
        version: SNAPSHOT_VERSION,
        createdAt: new Date().toISOString(),
        fixture: {
            game_id: mygame.fixture.game_id,
            venue: mygame.fixture.venue,
            officialdate: mygame.fixture.officialdate instanceof Date ? mygame.fixture.officialdate.toISOString() : mygame.fixture.officialdate,
            officialstarttime: mygame.fixture.officialstarttime,
            officialendtime: mygame.fixture.officialendtime,
            hometeam_name: mygame.fixture.hometeam_name,
            awayteam_name: mygame.fixture.awayteam_name,
            rules: {
                regsetpts: mygame.fixture.rules.regsetpts,
                nbsetswin: mygame.fixture.rules.nbsetswin,
                decidersetpts: mygame.fixture.rules.decidersetpts,
                ptsdiffwinpts: mygame.fixture.rules.ptsdiffwinpts,
                ptsdiffwinset: mygame.fixture.rules.ptsdiffwinset,
                swapsidesindecider: mygame.fixture.rules.swapsidesindecider,
                nbptsforswap: mygame.fixture.rules.nbptsforswap,
                maxnumberplayers: mygame.fixture.rules.maxnumberplayers,
                minliberoifthirteen: mygame.fixture.rules.minliberoifthirteen,
                allowPlayerStaffRoleCumulation: mygame.fixture.rules.allowPlayerStaffRoleCumulation
            },
            home_roster: deepClone(mygame.fixture.home_roster || []),
            away_roster: deepClone(mygame.fixture.away_roster || [])
        },
        setupState: deepClone(setupState),
        savedRuleProfiles: sanitizeSavedRuleProfiles(savedRuleProfiles),
        gameState: {
            sets: deepClone(mygame.sets),
            currentSet: deepClone(mygame.currentSet),
            setWins: deepClone(mygame.setWins),
            totalPoints: deepClone(mygame.totalPoints),
            pointHistory: deepClone(mygame.pointHistory),
            redoHistory: deepClone(mygame.redoHistory),
            game_interrupted: mygame.game_interrupted,
            interruptReason: mygame.interruptReason,
            servingstate: deepClone(mygame.servingstate),
            team_serving_before: mygame.team_serving_before,
            team_serving_startset: mygame.team_serving_startset,
            team_serving_deciderset: mygame.team_serving_deciderset,
            team_serving_currently: mygame.team_serving_currently,
            teamA: mygame.teamA,
            teamB: mygame.teamB,
            onLeft: mygame.onLeft,
            currentSetAcceptingMorePoints: mygame.currentSetAcceptingMorePoints,
            gameWinner: mygame.gameWinner,
            isGameOver: mygame.isGameOver,
            history: ensureHistory(mygame.history)
        }
    };
}

export function validateSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
        return { ok: false, message: 'Snapshot must be a JSON object.' };
    }
    if (snapshot.version !== SNAPSHOT_VERSION) {
        return { ok: false, message: `Unsupported snapshot version: ${snapshot.version}.` };
    }
    if (!snapshot.fixture || !snapshot.setupState || !snapshot.gameState) {
        return { ok: false, message: 'Snapshot is missing required sections.' };
    }
    return { ok: true };
}

export function applySnapshot({ snapshot, mygame, setupState, setSavedRuleProfiles }) {
    const validation = validateSnapshot(snapshot);
    if (!validation.ok) {
        throw new Error(validation.message);
    }

    const fixture = ensureObject(snapshot.fixture, {});
    const gameState = ensureObject(snapshot.gameState, {});
    const incomingSetup = ensureObject(snapshot.setupState, {});

    const fixtureRules = ensureObject(fixture.rules, {});
    mygame.fixture.game_id = fixture.game_id ?? mygame.fixture.game_id;
    mygame.fixture.venue = fixture.venue ?? mygame.fixture.venue;
    if (fixture.officialdate) {
        const parsedDate = new Date(fixture.officialdate);
        if (!Number.isNaN(parsedDate.valueOf())) {
            mygame.fixture.officialdate = parsedDate;
        }
    }
    mygame.fixture.officialstarttime = fixture.officialstarttime ?? mygame.fixture.officialstarttime;
    mygame.fixture.officialendtime = fixture.officialendtime ?? mygame.fixture.officialendtime;
    mygame.fixture.hometeam_name = fixture.hometeam_name ?? mygame.fixture.hometeam_name;
    mygame.fixture.awayteam_name = fixture.awayteam_name ?? mygame.fixture.awayteam_name;
    mygame.fixture.rules = new Rules(
        Number(fixtureRules.regsetpts),
        Number(fixtureRules.nbsetswin),
        Number(fixtureRules.decidersetpts),
        Number(fixtureRules.ptsdiffwinpts),
        Number(fixtureRules.ptsdiffwinset),
        Boolean(fixtureRules.swapsidesindecider),
        Number(fixtureRules.nbptsforswap),
        Number(fixtureRules.maxnumberplayers),
        Number(fixtureRules.minliberoifthirteen),
        Boolean(fixtureRules.allowPlayerStaffRoleCumulation)
    );
    mygame.fixture.home_roster = deepClone(Array.isArray(fixture.home_roster) ? fixture.home_roster : []);
    mygame.fixture.away_roster = deepClone(Array.isArray(fixture.away_roster) ? fixture.away_roster : []);

    const keys = Object.keys(setupState);
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(incomingSetup, key)) {
            setupState[key] = deepClone(incomingSetup[key]);
        }
    }

    if (typeof setSavedRuleProfiles === 'function') {
        setSavedRuleProfiles(sanitizeSavedRuleProfiles(snapshot.savedRuleProfiles));
    }

    mygame.sets = deepClone(Array.isArray(gameState.sets) ? gameState.sets : []);
    mygame.currentSet = deepClone(ensureObject(gameState.currentSet, { teamA: 0, teamB: 0 }));
    mygame.setWins = deepClone(ensureObject(gameState.setWins, { teamA: 0, teamB: 0 }));
    mygame.totalPoints = deepClone(ensureObject(gameState.totalPoints, { teamA: 0, teamB: 0 }));
    mygame.pointHistory = deepClone(Array.isArray(gameState.pointHistory) ? gameState.pointHistory : []);
    mygame.redoHistory = deepClone(Array.isArray(gameState.redoHistory) ? gameState.redoHistory : []);
    mygame.game_interrupted = Boolean(gameState.game_interrupted);
    mygame.interruptReason = typeof gameState.interruptReason === 'string' ? gameState.interruptReason : '';
    mygame.servingstate = deepClone(ensureObject(gameState.servingstate, { teamA: 'Unknown', teamB: 'Unknown' }));
    mygame.team_serving_before = gameState.team_serving_before || 'Unknown';
    if (isValidHomeAway(gameState.teamA)) {
        mygame.teamA = gameState.teamA;
    } else if (isValidHomeAway(gameState.teamB)) {
        mygame.teamB = gameState.teamB;
    } else {
        mygame._teamA = 'Unknown';
        mygame._teamB = 'Unknown';
    }
    if (isValidTeamId(gameState.team_serving_startset)) {
        mygame.team_serving_startset = gameState.team_serving_startset;
    } else {
        mygame._team_serving_startset = 'Unknown';
    }
    mygame._team_serving_deciderset = gameState.team_serving_deciderset || 'Unknown';
    if (gameState.team_serving_currently === 'teamA' || gameState.team_serving_currently === 'teamB') {
        mygame.team_serving_currently = gameState.team_serving_currently;
    } else {
        mygame.resetCurrentServingState();
    }
    mygame.onLeft = gameState.onLeft;
    mygame.currentSetAcceptingMorePoints = Boolean(gameState.currentSetAcceptingMorePoints);
    mygame.gameWinner = gameState.gameWinner || 'Unknown';
    mygame.isGameOver = Boolean(gameState.isGameOver);
    mygame.history = ensureHistory(gameState.history);
}
