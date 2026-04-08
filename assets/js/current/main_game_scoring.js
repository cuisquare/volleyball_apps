import Fixture from '../core/Fixture.js';
import Rules from '../core/Rules.js';
import Game from '../core/Game.js';
import { buildSnapshot, applySnapshot } from '../core/MatchStateSerializer.js';

const RULE_PRESETS = {
    london_league: {
        label: 'London League',
        values: {
            regsetpts: 21,
            nbsetswin: 3,
            decidersetpts: 15,
            ptsdiffwinpts: 2,
            ptsdiffwinset: 2,
            swapsidesindecider: false,
            nbptsforswap: 8,
            maxnumberplayers: 14,
            minliberoifthirteen: 1,
            allowPlayerStaffRoleCumulation: true,
            breakBetweenSetsMins: 3
        }
    },
    fivb: {
        label: 'FIVB',
        values: {
            regsetpts: 25,
            nbsetswin: 3,
            decidersetpts: 15,
            ptsdiffwinpts: 2,
            ptsdiffwinset: 2,
            swapsidesindecider: true,
            nbptsforswap: 8,
            maxnumberplayers: 14,
            minliberoifthirteen: 2,
            allowPlayerStaffRoleCumulation: true,
            breakBetweenSetsMins: 3
        }
    }
};

const DEFAULT_PROFILE_ID = 'preset:london_league';
const RULE_PROFILE_STORAGE_KEY = 'volleyball_rules_profiles_v1';
const MATCH_SNAPSHOT_STORAGE_KEY = 'volleyball_match_snapshot_v1';
const RULES_JSON_TYPE = 'volleyball_rules';
const RULES_JSON_VERSION = 2;
const TEAM_ROSTER_JSON_TYPE = 'volleyball_team_roster';
const TEAM_ROSTER_JSON_VERSION = 2;
const BENCH_ROLES = ['Coach', 'Assistant Coach 1', 'Assistant Coach 2', 'Therapist', 'Medical'];
let savedRuleProfiles = [];

const myfixture = new Fixture(
    '45',
    'Chestnut Grove Academy',
    new Date('2025-02-02T16:00:00'),
    '16:20',
    '18:00',
    'Home team',
    'Away team',
    new Rules()
);

const mygame = new Game(myfixture);

const setupState = {
    rulesConfirmed: false,
    rulesSource: 'none',
    rulesProfileId: 'none',
    rulesProfileLabel: 'Not Set',
    teamDetailsConfirmed: false,
    rosters: {
        home: [],
        away: []
    },
    editingRosterPlayerId: {
        home: '',
        away: ''
    },
    nextRosterPlayerId: 1,
    matchStarted: false,
    setupLocked: false,
    prematchTossConfirmed: false,
    deciderPromptShown: false,
    deciderLeftStarter: '',
    lineupsBySet: {},
    lineupPromptedSet: 0,
    activePanel: 'rules'
};

const elements = {
    scoreboardPanel: document.getElementById('scoreboard-panel'),
    lineupsPanel: document.getElementById('lineups-panel'),
    teamDetailsPanel: document.getElementById('team-details-panel'),
    setupPanel: document.getElementById('setup-panel'),
    rulesPanel: document.getElementById('rules-panel'),
    toggleScoreboardPanel: document.getElementById('toggle-scoreboard-panel'),
    toggleTeamDetailsPanel: document.getElementById('toggle-team-details-panel'),
    toggleSetupPanel: document.getElementById('toggle-setup-panel'),
    toggleLineupsPanel: document.getElementById('toggle-lineups-panel'),
    toggleRulesPanel: document.getElementById('toggle-rules-panel'),
    setupStatusBadge: document.getElementById('setup-status-badge'),
    rulesStatusBadge: document.getElementById('rules-status-badge'),
    setupFeedback: document.getElementById('setup-feedback'),
    rulesFeedback: document.getElementById('rules-feedback'),
    teamDetailsFeedback: document.getElementById('team-details-feedback'),
    lineupsFeedback: document.getElementById('lineups-feedback'),
    lineupsSetLabel: document.getElementById('lineups-set-label'),
    lineupsTeamACard: document.getElementById('lineups-teamA-card'),
    lineupsTeamBCard: document.getElementById('lineups-teamB-card'),
    lineupsTeamATitle: document.getElementById('lineups-teamA-title'),
    lineupsTeamBTitle: document.getElementById('lineups-teamB-title'),
    applyLineups: document.getElementById('apply-lineups'),
    lineupTeamAPos1: document.getElementById('lineup-teamA-pos1'),
    lineupTeamAPos2: document.getElementById('lineup-teamA-pos2'),
    lineupTeamAPos3: document.getElementById('lineup-teamA-pos3'),
    lineupTeamAPos4: document.getElementById('lineup-teamA-pos4'),
    lineupTeamAPos5: document.getElementById('lineup-teamA-pos5'),
    lineupTeamAPos6: document.getElementById('lineup-teamA-pos6'),
    lineupTeamBPos1: document.getElementById('lineup-teamB-pos1'),
    lineupTeamBPos2: document.getElementById('lineup-teamB-pos2'),
    lineupTeamBPos3: document.getElementById('lineup-teamB-pos3'),
    lineupTeamBPos4: document.getElementById('lineup-teamB-pos4'),
    lineupTeamBPos5: document.getElementById('lineup-teamB-pos5'),
    lineupTeamBPos6: document.getElementById('lineup-teamB-pos6'),
    applyTeamDetails: document.getElementById('apply-team-details'),
    exportHomeRosterJson: document.getElementById('export-home-roster-json'),
    importHomeRosterJson: document.getElementById('import-home-roster-json'),
    importHomeRosterJsonInput: document.getElementById('import-home-roster-json-input'),
    exportAwayRosterJson: document.getElementById('export-away-roster-json'),
    importAwayRosterJson: document.getElementById('import-away-roster-json'),
    importAwayRosterJsonInput: document.getElementById('import-away-roster-json-input'),
    rosterRulesHint: document.getElementById('roster-rules-hint'),
    homePlayerName: document.getElementById('home-player-name'),
    homePlayerIsPlayer: document.getElementById('home-player-is-player'),
    homePlayerNumber: document.getElementById('home-player-number'),
    homePlayerRegNumber: document.getElementById('home-player-reg-number'),
    homePlayerBenchRole: document.getElementById('home-player-bench-role'),
    homePlayerLibero: document.getElementById('home-player-libero'),
    homePlayerCaptain: document.getElementById('home-player-captain'),
    addHomePlayer: document.getElementById('add-home-player'),
    homeRosterCount: document.getElementById('home-roster-count'),
    homeBenchRosterBody: document.getElementById('home-bench-roster-body'),
    homeRegularRosterBody: document.getElementById('home-regular-roster-body'),
    homeLiberoRosterBody: document.getElementById('home-libero-roster-body'),
    awayPlayerName: document.getElementById('away-player-name'),
    awayPlayerIsPlayer: document.getElementById('away-player-is-player'),
    awayPlayerNumber: document.getElementById('away-player-number'),
    awayPlayerRegNumber: document.getElementById('away-player-reg-number'),
    awayPlayerBenchRole: document.getElementById('away-player-bench-role'),
    awayPlayerLibero: document.getElementById('away-player-libero'),
    awayPlayerCaptain: document.getElementById('away-player-captain'),
    addAwayPlayer: document.getElementById('add-away-player'),
    awayRosterCount: document.getElementById('away-roster-count'),
    awayBenchRosterBody: document.getElementById('away-bench-roster-body'),
    awayRegularRosterBody: document.getElementById('away-regular-roster-body'),
    awayLiberoRosterBody: document.getElementById('away-libero-roster-body'),
    applyPrematchToss: document.getElementById('apply-prematch-toss'),
    startMatch: document.getElementById('start-match'),
    quickSaveMatch: document.getElementById('quick-save-match'),
    quickLoadMatch: document.getElementById('quick-load-match'),
    exportMatchJson: document.getElementById('export-match-json'),
    importMatchJson: document.getElementById('import-match-json'),
    importMatchJsonInput: document.getElementById('import-match-json-input'),
    rulesProfile: document.getElementById('rules-profile'),
    applyRulesProfile: document.getElementById('apply-rules-profile'),
    exportRulesJson: document.getElementById('export-rules-json'),
    importRulesJson: document.getElementById('import-rules-json'),
    importRulesJsonInput: document.getElementById('import-rules-json-input'),
    newRulesProfileName: document.getElementById('new-rules-profile-name'),
    saveRulesProfile: document.getElementById('save-rules-profile'),
    deleteRulesProfile: document.getElementById('delete-rules-profile'),
    rulesPresetSummary: document.getElementById('rules-preset-summary'),
    customRulesCard: document.getElementById('custom-rules-card'),
    saveCustomRules: document.getElementById('save-custom-rules'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    completeSet: document.getElementById('completeSet'),
    completeGame: document.getElementById('completeGame'),
    undoLastPoint: document.getElementById('undo-last-point'),
    redoLastPoint: document.getElementById('redo-last-point'),
    teamAName: document.getElementById('name-teamA'),
    teamBName: document.getElementById('name-teamB'),
    scoreTeamA: document.getElementById('score-teamA'),
    scoreTeamB: document.getElementById('score-teamB'),
    setsTeamA: document.getElementById('sets-teamA'),
    setsTeamB: document.getElementById('sets-teamB'),
    pointsTeamA: document.getElementById('points-teamA'),
    pointsTeamB: document.getElementById('points-teamB'),
    servingStateTeamA: document.getElementById('servingstate-teamA'),
    servingStateTeamB: document.getElementById('servingstate-teamB'),
    gameStatus: document.getElementById('game-status'),
    teamsContainer: document.getElementById('teams-container'),
    incTeamA: document.getElementById('increase-score-teamA'),
    incTeamB: document.getElementById('increase-score-teamB'),
    homeTeamName: document.getElementById('home-team-name'),
    awayTeamName: document.getElementById('away-team-name'),
    regsetpts: document.getElementById('regsetpts'),
    nbsetswin: document.getElementById('nbsetswin'),
    decidersetpts: document.getElementById('decidersetpts'),
    ptsdiffwinpts: document.getElementById('ptsdiffwinpts'),
    ptsdiffwinset: document.getElementById('ptsdiffwinset'),
    swapsidesindecider: document.getElementById('swapsidesindecider'),
    nbptsforswap: document.getElementById('nbptsforswap'),
    maxnumberplayers: document.getElementById('maxnumberplayers'),
    minliberoifthirteen: document.getElementById('minliberoifthirteen'),
    breakBetweenSetsMins: document.getElementById('breakbetweensetsmins'),
    allowPlayerStaffRoleCumulation: document.getElementById('allow-player-staff-role-cumulation'),
    deciderCard: document.getElementById('decider-toss-card'),
    deciderLeftTeam: document.getElementById('decider-left-team'),
    deciderServingTeam: document.getElementById('decider-serving-team'),
    applyDeciderToss: document.getElementById('apply-decider-toss')
};

function setActivePanel(panelName) {
    setupState.activePanel = panelName;

    elements.scoreboardPanel.classList.toggle('hidden', panelName !== 'scoreboard');
    elements.lineupsPanel.classList.toggle('hidden', panelName !== 'lineups');
    elements.teamDetailsPanel.classList.toggle('hidden', panelName !== 'teamDetails');
    elements.setupPanel.classList.toggle('hidden', panelName !== 'setup');
    elements.rulesPanel.classList.toggle('hidden', panelName !== 'rules');

    elements.toggleScoreboardPanel.classList.toggle('active-tab', panelName === 'scoreboard');
    elements.toggleLineupsPanel.classList.toggle('active-tab', panelName === 'lineups');
    elements.toggleTeamDetailsPanel.classList.toggle('active-tab', panelName === 'teamDetails');
    elements.toggleSetupPanel.classList.toggle('active-tab', panelName === 'setup');
    elements.toggleRulesPanel.classList.toggle('active-tab', panelName === 'rules');
}

function setLineupsFeedback(message, variant = '') {
    elements.lineupsFeedback.textContent = message;
    elements.lineupsFeedback.classList.remove('error', 'success');
    if (variant) {
        elements.lineupsFeedback.classList.add(variant);
    }
}

function setSetupFeedback(message, variant = '') {
    elements.setupFeedback.textContent = message;
    elements.setupFeedback.classList.remove('error', 'success');
    if (variant) {
        elements.setupFeedback.classList.add(variant);
    }
}

function setRulesFeedback(message, variant = '') {
    elements.rulesFeedback.textContent = message;
    elements.rulesFeedback.classList.remove('error', 'success');
    if (variant) {
        elements.rulesFeedback.classList.add(variant);
    }
}

function setTeamDetailsFeedback(message, variant = '') {
    elements.teamDetailsFeedback.textContent = message;
    elements.teamDetailsFeedback.classList.remove('error', 'success');
    if (variant) {
        elements.teamDetailsFeedback.classList.add(variant);
    }
}

function setGlobalFeedback(message, variant = '') {
    setSetupFeedback(message, variant);
    setRulesFeedback(message, variant);
    setTeamDetailsFeedback(message, variant);
    setLineupsFeedback(message, variant);
}

function getCurrentRulesValuesFromFixture() {
    return {
        regsetpts: mygame.fixture.rules.regsetpts,
        nbsetswin: mygame.fixture.rules.nbsetswin,
        decidersetpts: mygame.fixture.rules.decidersetpts,
        ptsdiffwinpts: mygame.fixture.rules.ptsdiffwinpts,
        ptsdiffwinset: mygame.fixture.rules.ptsdiffwinset,
        swapsidesindecider: mygame.fixture.rules.swapsidesindecider,
        nbptsforswap: mygame.fixture.rules.nbptsforswap,
        maxnumberplayers: mygame.fixture.rules.maxnumberplayers,
        minliberoifthirteen: mygame.fixture.rules.minliberoifthirteen,
        breakBetweenSetsMins: mygame.fixture.rules.breakBetweenSetsMins,
        allowPlayerStaffRoleCumulation: Boolean(mygame.fixture.rules.allowPlayerStaffRoleCumulation)
    };
}

function setRadioCheckedValue(groupName, value) {
    for (const radio of document.querySelectorAll(`input[name="${groupName}"]`)) {
        radio.checked = radio.value === value;
    }
}

function clearRadioGroup(groupName) {
    for (const radio of document.querySelectorAll(`input[name="${groupName}"]`)) {
        radio.checked = false;
    }
}

function setSavedRuleProfilesFromSnapshot(profiles) {
    const nextProfiles = [];
    if (Array.isArray(profiles)) {
        for (const profile of profiles) {
            if (!profile || typeof profile.id !== 'string' || typeof profile.name !== 'string') {
                continue;
            }
            try {
                nextProfiles.push({
                    id: profile.id,
                    name: profile.name.trim(),
                    values: normalizeRulesValues(profile.values || {})
                });
            } catch {
                continue;
            }
        }
    }
    savedRuleProfiles = nextProfiles;
    persistSavedRuleProfiles();
}

function syncUiFromLoadedState() {
    elements.homeTeamName.value = mygame.fixture.hometeam_name || '';
    elements.awayTeamName.value = mygame.fixture.awayteam_name || '';
    setupState.rosters.home = Array.isArray(setupState.rosters.home)
        ? setupState.rosters.home.map(normalizeExistingRosterEntry).filter(Boolean)
        : [];
    setupState.rosters.away = Array.isArray(setupState.rosters.away)
        ? setupState.rosters.away.map(normalizeExistingRosterEntry).filter(Boolean)
        : [];
    mygame.fixture.home_roster = setupState.rosters.home.map((player) => ({ ...player }));
    mygame.fixture.away_roster = setupState.rosters.away.map((player) => ({ ...player }));

    if (mygame.teamA === 'home' || mygame.teamA === 'away') {
        setRadioCheckedValue('setup-left-starter', mygame.teamA);
    } else {
        clearRadioGroup('setup-left-starter');
    }
    if (mygame.team_serving_startset === 'teamA' || mygame.team_serving_startset === 'teamB') {
        setRadioCheckedValue('setup-first-server', mygame.team_serving_startset);
    } else {
        clearRadioGroup('setup-first-server');
    }

    elements.deciderLeftTeam.value = setupState.deciderLeftStarter || '';
    if (mygame.team_serving_deciderset === 'teamA' || mygame.team_serving_deciderset === 'teamB') {
        elements.deciderServingTeam.value = mygame.team_serving_deciderset;
    } else {
        elements.deciderServingTeam.value = '';
    }

    const selectedProfileId = setupState.rulesProfileId && setupState.rulesProfileId !== 'none'
        ? setupState.rulesProfileId
        : DEFAULT_PROFILE_ID;
    rebuildRulesProfileOptions(selectedProfileId);
    setRulesFormValues(getCurrentRulesValuesFromFixture());
    updateRulesPanelView();
    renderRosters();
    syncRosterEntryFormState('home');
    syncRosterEntryFormState('away');
}

function exportSnapshotToJsonFile(snapshot) {
    const homeName = (mygame.fixture.hometeam_name || 'home').trim();
    const awayName = (mygame.fixture.awayteam_name || 'away').trim();
    const stageTag = getMatchStageTagForFilename();
    const matchLabel = `${homeName}_vs_${awayName}_${stageTag}`;
    exportJsonToFile(`volleyball_match_snapshot_${toSafeFilenameToken(matchLabel)}`, snapshot);
}

function exportJsonToFile(prefix, payload) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${prefix}_${timestamp}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function toSafeFilenameToken(rawValue) {
    return String(rawValue || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'item';
}

function getMatchStageTagForFilename() {
    if (mygame.isGameOver) {
        return 'game_over';
    }
    if (!setupState.matchStarted) {
        return 'pre_match';
    }
    const setNumber = mygame.getCurrentSet();
    if (setNumber > 0) {
        return `set_${setNumber}`;
    }
    return 'in_progress';
}

function canImportSetupJson(kindLabel) {
    if (!setupState.matchStarted) {
        return true;
    }
    setGlobalFeedback(`${kindLabel} import is only available before match start.`, 'error');
    return false;
}

function refreshPrematchLockState() {
    if (setupState.matchStarted) {
        lockPrematchSetup();
        return;
    }

    setupState.setupLocked = false;
    for (const input of [
        elements.homeTeamName,
        elements.awayTeamName,
        elements.rulesProfile,
        elements.homePlayerName,
        elements.homePlayerNumber,
        elements.homePlayerRegNumber,
        elements.homePlayerLibero,
        elements.homePlayerCaptain,
        elements.awayPlayerName,
        elements.awayPlayerNumber,
        elements.awayPlayerRegNumber,
        elements.awayPlayerLibero,
        elements.awayPlayerCaptain,
        elements.importRulesJson,
        elements.importHomeRosterJson,
        elements.importAwayRosterJson
    ]) {
        input.disabled = false;
    }
    for (const radio of document.querySelectorAll('input[name="setup-left-starter"], input[name="setup-first-server"]')) {
        radio.disabled = false;
    }
}

function applyLoadedSnapshotData(snapshot, sourceLabel) {
    applySnapshot({
        snapshot,
        mygame,
        setupState,
        setSavedRuleProfiles: setSavedRuleProfilesFromSnapshot
    });

    syncUiFromLoadedState();
    refreshPrematchLockState();
    updateRulesPanelView();

    const allowedPanels = new Set(['scoreboard', 'rules', 'teamDetails', 'setup', 'lineups']);
    const preferredPanel = allowedPanels.has(setupState.activePanel)
        ? setupState.activePanel
        : (setupState.matchStarted ? 'scoreboard' : 'rules');
    setActivePanel(preferredPanel);

    setGlobalFeedback(`Loaded ${sourceLabel}.`, 'success');
    updateSetsElements();
}

function quickSaveMatchState() {
    try {
        const snapshot = buildSnapshot({ mygame, setupState, savedRuleProfiles });
        localStorage.setItem(MATCH_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
        setGlobalFeedback('Quick save complete.', 'success');
    } catch (error) {
        setGlobalFeedback(`Quick save failed: ${error.message}`, 'error');
    }
}

function quickLoadMatchState() {
    const rawSnapshot = localStorage.getItem(MATCH_SNAPSHOT_STORAGE_KEY);
    if (!rawSnapshot) {
        setGlobalFeedback('No quick save found in browser storage.', 'error');
        return;
    }

    try {
        const snapshot = JSON.parse(rawSnapshot);
        applyLoadedSnapshotData(snapshot, 'quick save');
    } catch (error) {
        setGlobalFeedback(`Quick load failed: ${error.message}`, 'error');
    }
}

function exportMatchStateAsJson() {
    try {
        const snapshot = buildSnapshot({ mygame, setupState, savedRuleProfiles });
        exportSnapshotToJsonFile(snapshot);
        setGlobalFeedback('Match snapshot exported to JSON.', 'success');
    } catch (error) {
        setGlobalFeedback(`Export failed: ${error.message}`, 'error');
    }
}

function importMatchStateFromJson() {
    elements.importMatchJsonInput.value = '';
    elements.importMatchJsonInput.click();
}

async function handleImportMatchJsonFile(event) {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) {
        return;
    }

    try {
        const text = await selectedFile.text();
        const snapshot = JSON.parse(text);
        applyLoadedSnapshotData(snapshot, `JSON file "${selectedFile.name}"`);
    } catch (error) {
        setGlobalFeedback(`Import failed: ${error.message}`, 'error');
    } finally {
        elements.importMatchJsonInput.value = '';
    }
}

function getRulesJsonExportValues() {
    const selectedProfile = parseProfileSelection(elements.rulesProfile.value);
    if (!setupState.matchStarted && selectedProfile.type === 'custom') {
        return getRulesFromForm();
    }
    return normalizeRulesValues(getCurrentRulesValuesFromFixture());
}

function buildRulesJsonPayload() {
    const values = getRulesJsonExportValues();
    return {
        type: RULES_JSON_TYPE,
        version: RULES_JSON_VERSION,
        exportedAt: new Date().toISOString(),
        profile: {
            id: setupState.rulesProfileId || 'custom',
            label: setupState.rulesProfileLabel || 'Custom'
        },
        values
    };
}

function exportRulesAsJson() {
    try {
        const payload = buildRulesJsonPayload();
        const profileLabel = payload.profile && payload.profile.label ? payload.profile.label : 'rules';
        exportJsonToFile(`volleyball_rules_${toSafeFilenameToken(profileLabel)}`, payload);
        setGlobalFeedback('Rules exported to JSON.', 'success');
    } catch (error) {
        setGlobalFeedback(`Rules export failed: ${error.message}`, 'error');
    }
}

function importRulesFromJson() {
    if (!canImportSetupJson('Rules')) {
        return;
    }
    elements.importRulesJsonInput.value = '';
    elements.importRulesJsonInput.click();
}

function parseImportedRulesPayload(parsed) {
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Rules JSON must be an object.');
    }

    if (typeof parsed.type === 'string' && parsed.type !== RULES_JSON_TYPE) {
        throw new Error(`Unsupported rules JSON type: ${parsed.type}.`);
    }
    const rulesVersion = Number(parsed.version);
    if (parsed.type === RULES_JSON_TYPE && rulesVersion !== 1 && rulesVersion !== RULES_JSON_VERSION) {
        throw new Error(`Unsupported rules JSON version: ${parsed.version}.`);
    }

    const valuesSource = parsed.values && typeof parsed.values === 'object' ? parsed.values : parsed;
    const values = normalizeRulesValues(valuesSource);
    const profileLabel = parsed.profile && typeof parsed.profile.label === 'string'
        ? parsed.profile.label.trim() || 'Imported JSON'
        : 'Imported JSON';

    return { values, profileLabel };
}

async function handleImportRulesJsonFile(event) {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) {
        return;
    }

    try {
        if (!canImportSetupJson('Rules')) {
            return;
        }

        const text = await selectedFile.text();
        const parsed = JSON.parse(text);
        const imported = parseImportedRulesPayload(parsed);

        applyRules(imported.values);
        setRulesFormValues(imported.values);
        rebuildRulesProfileOptions('custom');
        elements.rulesProfile.value = 'custom';

        setupState.rulesConfirmed = true;
        setupState.rulesSource = 'custom';
        setupState.rulesProfileId = 'custom';
        setupState.rulesProfileLabel = imported.profileLabel;
        setupState.teamDetailsConfirmed = false;
        setupState.prematchTossConfirmed = false;
        resetLineupsState();

        mygame.addExternalEvent('rules_imported_json', {
            fileName: selectedFile.name,
            values: { ...imported.values }
        });

        setRulesFeedback('Rules imported from JSON. Team details/toss choices need confirmation.', 'success');
        setSetupFeedback('Rules imported. Next step: apply team details, then prematch toss choices.', 'success');
        setActivePanel('teamDetails');
        updateRulesPanelView();
        updateSetsElements();
    } catch (error) {
        setGlobalFeedback(`Rules import failed: ${error.message}`, 'error');
    } finally {
        elements.importRulesJsonInput.value = '';
    }
}

function normalizeImportedRosterPlayer(rawPlayer, teamLabel, index) {
    if (!rawPlayer || typeof rawPlayer !== 'object') {
        throw new Error(`${teamLabel} roster entry ${index + 1} is invalid.`);
    }

    const name = typeof rawPlayer.name === 'string' ? rawPlayer.name.trim() : '';
    if (!name) {
        throw new Error(`${teamLabel} roster entry ${index + 1} is missing a player name.`);
    }

    const isPlayer = rawPlayer.isPlayer !== undefined ? Boolean(rawPlayer.isPlayer) : true;
    const shirtNumber = Number.parseInt(rawPlayer.shirtNumber, 10);
    const regNumber = rawPlayer.regNumber == null ? '' : String(rawPlayer.regNumber).trim();
    const benchRole = normalizeBenchRole(rawPlayer.benchRole);
    const isLibero = isPlayer && Boolean(rawPlayer.isLibero);
    const isCaptain = isPlayer && Boolean(rawPlayer.isCaptain);

    if (isPlayer && (!Number.isInteger(shirtNumber) || shirtNumber <= 0)) {
        throw new Error(`${teamLabel} roster entry ${index + 1} has invalid shirt number.`);
    }

    return {
        id: '',
        name,
        shirtNumber: isPlayer ? shirtNumber : null,
        regNumber,
        isPlayer,
        isLibero,
        isCaptain,
        benchRole
    };
}

function withGeneratedRosterIds(roster) {
    return roster.map((player) => ({
        ...player,
        id: `p_${setupState.nextRosterPlayerId++}`
    }));
}

function getTeamSideLabel(teamSide) {
    return teamSide === 'home' ? 'Home' : 'Away';
}

function buildSingleTeamRosterJsonPayload(teamSide) {
    const teamName = teamSide === 'home'
        ? (elements.homeTeamName.value || '').trim()
        : (elements.awayTeamName.value || '').trim();
    const roster = (setupState.rosters[teamSide] || []).map((player) => ({ ...player }));
    return {
        type: TEAM_ROSTER_JSON_TYPE,
        version: TEAM_ROSTER_JSON_VERSION,
        exportedAt: new Date().toISOString(),
        teamName,
        roster
    };
}

function exportSingleTeamRosterAsJson(teamSide) {
    try {
        const payload = buildSingleTeamRosterJsonPayload(teamSide);
        const rawTeamName = payload.teamName || getTeamSideLabel(teamSide);
        const safeTeamName = toSafeFilenameToken(rawTeamName);
        exportJsonToFile(`volleyball_roster_${safeTeamName}`, payload);
        setGlobalFeedback(`${getTeamSideLabel(teamSide)} roster exported to JSON.`, 'success');
    } catch (error) {
        setGlobalFeedback(`${getTeamSideLabel(teamSide)} roster export failed: ${error.message}`, 'error');
    }
}

function parseImportedSingleRosterPayload(parsed, expectedTeamSide) {
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Team roster JSON must be an object.');
    }

    if (typeof parsed.type === 'string' && parsed.type !== TEAM_ROSTER_JSON_TYPE) {
        throw new Error(`Unsupported team roster JSON type: ${parsed.type}.`);
    }
    const rosterVersion = Number(parsed.version);
    if (parsed.type === TEAM_ROSTER_JSON_TYPE && rosterVersion !== 1 && rosterVersion !== TEAM_ROSTER_JSON_VERSION) {
        throw new Error(`Unsupported team roster JSON version: ${parsed.version}.`);
    }

    const teamName = typeof parsed.teamName === 'string' ? parsed.teamName.trim() : '';
    const rawRoster = Array.isArray(parsed.roster) ? parsed.roster : [];
    const roster = rawRoster.map((player, index) => normalizeImportedRosterPlayer(player, getTeamSideLabel(expectedTeamSide), index));
    const rosterEntryError = validateRosterEntryForTeam(expectedTeamSide, roster);
    if (rosterEntryError) {
        throw new Error(rosterEntryError);
    }

    return { teamName, roster };
}

function importSingleTeamRosterFromJson(teamSide) {
    if (!canImportSetupJson(`${getTeamSideLabel(teamSide)} roster`)) {
        return;
    }
    const input = teamSide === 'home' ? elements.importHomeRosterJsonInput : elements.importAwayRosterJsonInput;
    input.value = '';
    input.click();
}

async function handleImportSingleTeamRosterJsonFile(event, teamSide) {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) {
        return;
    }

    try {
        if (!canImportSetupJson(`${getTeamSideLabel(teamSide)} roster`)) {
            return;
        }

        const text = await selectedFile.text();
        const parsed = JSON.parse(text);
        const imported = parseImportedSingleRosterPayload(parsed, teamSide);
        setupState.editingRosterPlayerId[teamSide] = '';
        setupState.rosters[teamSide] = withGeneratedRosterIds(imported.roster);

        if (imported.teamName) {
            if (teamSide === 'home') {
                elements.homeTeamName.value = imported.teamName;
            } else {
                elements.awayTeamName.value = imported.teamName;
            }
        }

        setupState.teamDetailsConfirmed = false;
        setupState.prematchTossConfirmed = false;
        resetLineupsState();

        mygame.addExternalEvent('single_roster_imported_json', {
            fileName: selectedFile.name,
            teamSide,
            teamCount: setupState.rosters[teamSide].length
        });

        renderRosters();
        setTeamDetailsFeedback(`${getTeamSideLabel(teamSide)} roster imported. Click Apply Team Details to confirm this setup.`, 'success');
        setSetupFeedback(`${getTeamSideLabel(teamSide)} roster imported. Apply Team Details before prematch toss choices.`, 'success');
        setActivePanel('teamDetails');
        updateSetsElements();
    } catch (error) {
        setGlobalFeedback(`${getTeamSideLabel(teamSide)} roster import failed: ${error.message}`, 'error');
    } finally {
        event.target.value = '';
    }
}

function getActiveRulesLabelForMessage() {
    if (setupState.rulesProfileLabel && setupState.rulesProfileLabel !== 'Not Set') {
        return setupState.rulesProfileLabel;
    }

    const selectedProfile = parseProfileSelection(elements.rulesProfile.value);
    if (selectedProfile.type === 'preset' || selectedProfile.type === 'saved') {
        return selectedProfile.label;
    }
    if (selectedProfile.type === 'custom') {
        return 'Custom';
    }

    return 'Selected';
}

function withRulesContext(message) {
    return `${message} (${getActiveRulesLabelForMessage()} rules)`;
}

function getMaxRosterPlayers() {
    return Number(mygame.fixture.rules.maxnumberplayers) || 14;
}

function getMinLiberosIfThirteen() {
    return Number(mygame.fixture.rules.minliberoifthirteen) || 0;
}

function getMaxLiberosPerRoster() {
    return 2;
}

function markTeamDetailsDirty() {
    if (setupState.matchStarted) {
        return;
    }

    setupState.teamDetailsConfirmed = false;
    setupState.prematchTossConfirmed = false;
    resetLineupsState();
}

function updateRosterRuleHint() {
    const maxPlayers = getMaxRosterPlayers();
    const minLiberos = getMinLiberosIfThirteen();
    const maxLiberos = getMaxLiberosPerRoster();
    const cumulationHint = mygame.fixture.rules.allowPlayerStaffRoleCumulation
        ? 'Player/staff role cumulation is allowed.'
        : 'Player/staff role cumulation is not allowed.';
    elements.rosterRulesHint.textContent = `Roster limits: up to ${maxPlayers} players per team, max ${maxLiberos} liberos, and at least 6 non-libero players. If roster has exactly 13 players, at least ${minLiberos} libero(s) are required. ${cumulationHint}`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeBenchRole(rawBenchRole) {
    const benchRole = rawBenchRole == null ? '' : String(rawBenchRole).trim();
    return BENCH_ROLES.includes(benchRole) ? benchRole : '';
}

function normalizeExistingRosterEntry(rawPlayer) {
    if (!rawPlayer || typeof rawPlayer !== 'object') {
        return null;
    }

    const isPlayer = rawPlayer.isPlayer !== undefined ? Boolean(rawPlayer.isPlayer) : true;
    const shirtNumber = Number.parseInt(rawPlayer.shirtNumber, 10);

    return {
        id: typeof rawPlayer.id === 'string' ? rawPlayer.id : '',
        name: typeof rawPlayer.name === 'string' ? rawPlayer.name.trim() : '',
        shirtNumber: isPlayer && Number.isInteger(shirtNumber) && shirtNumber > 0 ? shirtNumber : null,
        regNumber: rawPlayer.regNumber == null ? '' : String(rawPlayer.regNumber).trim(),
        isPlayer,
        isLibero: isPlayer && Boolean(rawPlayer.isLibero),
        isCaptain: isPlayer && Boolean(rawPlayer.isCaptain),
        benchRole: normalizeBenchRole(rawPlayer.benchRole)
    };
}

function getRosterInputs(teamSide) {
    if (teamSide === 'home') {
        return {
            nameInput: elements.homePlayerName,
            isPlayerInput: elements.homePlayerIsPlayer,
            numberInput: elements.homePlayerNumber,
            regInput: elements.homePlayerRegNumber,
            benchRoleInput: elements.homePlayerBenchRole,
            liberoInput: elements.homePlayerLibero,
            captainInput: elements.homePlayerCaptain,
            addButton: elements.addHomePlayer,
            regularBody: elements.homeRegularRosterBody,
            benchBody: elements.homeBenchRosterBody,
            liberoBody: elements.homeLiberoRosterBody,
            count: elements.homeRosterCount
        };
    }

    return {
        nameInput: elements.awayPlayerName,
        isPlayerInput: elements.awayPlayerIsPlayer,
        numberInput: elements.awayPlayerNumber,
        regInput: elements.awayPlayerRegNumber,
        benchRoleInput: elements.awayPlayerBenchRole,
        liberoInput: elements.awayPlayerLibero,
        captainInput: elements.awayPlayerCaptain,
        addButton: elements.addAwayPlayer,
        regularBody: elements.awayRegularRosterBody,
        benchBody: elements.awayBenchRosterBody,
        liberoBody: elements.awayLiberoRosterBody,
        count: elements.awayRosterCount
    };
}

function syncRosterEntryFormState(teamSide) {
    const controls = getRosterInputs(teamSide);
    const isPlayer = controls.isPlayerInput.checked;
    controls.numberInput.disabled = !isPlayer || setupState.matchStarted;
    controls.liberoInput.disabled = !isPlayer || setupState.matchStarted;
    controls.captainInput.disabled = !isPlayer || setupState.matchStarted;

    if (!isPlayer) {
        controls.liberoInput.checked = false;
        controls.captainInput.checked = false;
    }
}

function renderRoster(teamSide) {
    const roster = setupState.rosters[teamSide];
    const controls = getRosterInputs(teamSide);
    controls.benchBody.innerHTML = '';
    controls.regularBody.innerHTML = '';
    controls.liberoBody.innerHTML = '';

    const maxPlayers = getMaxRosterPlayers();
    const players = roster.filter((player) => player.isPlayer);
    const benchPersonnel = roster.filter((player) => player.benchRole);
    const nonLiberos = players.filter((player) => !player.isLibero).length;
    const liberos = players.filter((player) => player.isLibero).length;
    const captains = players.filter((player) => player.isCaptain).length;
    const missingPlayers = Math.max(0, 6 - players.length);
    const missingNonLiberos = Math.max(0, 6 - nonLiberos);
    let readinessHint = 'Ready';
    const minLiberosIfThirteen = getMinLiberosIfThirteen();
    const missingLiberosAtThirteen = players.length >= 13 ? Math.max(0, minLiberosIfThirteen - liberos) : 0;
    const missingCaptain = captains === 0 ? 1 : 0;
    if (missingPlayers > 0 || missingNonLiberos > 0 || missingLiberosAtThirteen > 0 || missingCaptain > 0) {
        const parts = [];
        if (missingPlayers > 0) {
            parts.push(`${missingPlayers} player(s)`);
        }
        if (missingNonLiberos > 0) {
            parts.push(`${missingNonLiberos} non-libero`);
        }
        if (missingLiberosAtThirteen > 0) {
            parts.push(`${missingLiberosAtThirteen} libero(s) for 13-player rule`);
        }
        if (missingCaptain > 0) {
            parts.push('1 captain');
        }
        readinessHint = `Not ready: need ${parts.join(', ')}`;
    }
    controls.count.textContent = `${roster.length} entries (${players.length} / ${maxPlayers} players, Bench ${benchPersonnel.length}, Libero ${liberos}/${getMaxLiberosPerRoster()}, Captain ${captains}) - ${readinessHint}`;

    const byShirtNumber = (playerA, playerB) => {
        const shirtNumberA = playerA.shirtNumber || 0;
        const shirtNumberB = playerB.shirtNumber || 0;
        if (shirtNumberA !== shirtNumberB) {
            return shirtNumberA - shirtNumberB;
        }
        return playerA.name.localeCompare(playerB.name);
    };

    const regularPlayers = players.filter((player) => !player.isLibero).sort(byShirtNumber);
    const liberoPlayers = players.filter((player) => player.isLibero).sort(byShirtNumber);
    const benchPlayers = benchPersonnel.sort((playerA, playerB) => {
        if (playerA.benchRole !== playerB.benchRole) {
            return playerA.benchRole.localeCompare(playerB.benchRole);
        }
        return playerA.name.localeCompare(playerB.name);
    });

    const renderRows = (targetBody, players, emptyText) => {
        if (players.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td class="roster-empty" colspan="5">${emptyText}</td>`;
            targetBody.appendChild(emptyRow);
            return;
        }

        for (const player of players) {
            const canRemove = !setupState.matchStarted;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(player.name)}</td>
                <td>${player.shirtNumber}</td>
                <td>${player.regNumber ? escapeHtml(player.regNumber) : '-'}</td>
                <td>${player.isCaptain ? 'Yes' : '-'}</td>
                <td>
                    <button class="table-action-btn edit-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Edit</button>
                    <button class="table-action-btn remove-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Remove</button>
                </td>
            `;
            targetBody.appendChild(row);
        }
    };

    const renderBenchRows = (targetBody, players, emptyText) => {
        if (players.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td class="roster-empty" colspan="6">${emptyText}</td>`;
            targetBody.appendChild(emptyRow);
            return;
        }

        for (const player of players) {
            const canRemove = !setupState.matchStarted;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(player.name)}</td>
                <td>${escapeHtml(player.benchRole)}</td>
                <td>${player.isPlayer ? 'Yes' : '-'}</td>
                <td>${player.isPlayer && player.shirtNumber ? player.shirtNumber : '-'}</td>
                <td>${player.regNumber ? escapeHtml(player.regNumber) : '-'}</td>
                <td>
                    <button class="table-action-btn edit-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Edit</button>
                    <button class="table-action-btn remove-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Remove</button>
                </td>
            `;
            targetBody.appendChild(row);
        }
    };

    renderBenchRows(controls.benchBody, benchPlayers, 'No bench personnel yet.');
    renderRows(controls.regularBody, regularPlayers, 'No regular players yet.');
    renderRows(controls.liberoBody, liberoPlayers, 'No libero players yet.');

    const isEditing = Boolean(setupState.editingRosterPlayerId[teamSide]);
    controls.addButton.textContent = isEditing
        ? (teamSide === 'home' ? 'Save Home Entry' : 'Save Away Entry')
        : (teamSide === 'home' ? 'Add Home Entry' : 'Add Away Entry');
}

function renderRosters() {
    renderRoster('home');
    renderRoster('away');
}

function createDefaultRoster() {
    const roster = [];
    for (let i = 1; i <= 6; i++) {
        roster.push({
            id: `p_${setupState.nextRosterPlayerId++}`,
            name: `Player ${i}`,
            shirtNumber: i,
            regNumber: '',
            isPlayer: true,
            isLibero: false,
            isCaptain: i === 1,
            benchRole: ''
        });
    }
    return roster;
}

function validateRosterForTeam(teamSide, roster) {
    const players = roster.filter((player) => player.isPlayer);
    if (players.length < 6) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least 6 players.`);
    }

    const maxPlayers = getMaxRosterPlayers();
    if (players.length > maxPlayers) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot exceed ${maxPlayers} players.`);
    }

    const numbers = new Set();
    for (const player of players) {
        if (numbers.has(player.shirtNumber)) {
            return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster has duplicate shirt number ${player.shirtNumber}.`);
        }
        numbers.add(player.shirtNumber);
    }

    const liberos = players.filter((player) => player.isLibero).length;
    const maxLiberos = getMaxLiberosPerRoster();
    if (liberos > maxLiberos) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot have more than ${maxLiberos} liberos.`);
    }

    const captains = players.filter((player) => player.isCaptain).length;
    if (captains < 1) {
        return `${teamSide === 'home' ? 'Home' : 'Away'} roster must include exactly 1 captain.`;
    }
    if (captains > 1) {
        return `${teamSide === 'home' ? 'Home' : 'Away'} roster must include exactly 1 captain.`;
    }

    const nonLiberos = players.length - liberos;
    if (nonLiberos < 6) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least 6 non-libero players.`);
    }

    if (players.length >= 13) {
        const minLiberos = getMinLiberosIfThirteen();
        if (liberos < minLiberos) {
            return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least ${minLiberos} libero(s) when 13 players are listed.`);
        }
    }

    return '';
}

function validateRosterEntryForTeam(teamSide, roster) {
    const teamLabel = teamSide === 'home' ? 'Home' : 'Away';
    const players = roster.filter((player) => player.isPlayer);

    const maxPlayers = getMaxRosterPlayers();
    if (players.length > maxPlayers) {
        return withRulesContext(`${teamLabel} roster cannot exceed ${maxPlayers} players.`);
    }

    const numbers = new Set();
    for (const player of players) {
        if (numbers.has(player.shirtNumber)) {
            return withRulesContext(`${teamLabel} roster has duplicate shirt number ${player.shirtNumber}.`);
        }
        numbers.add(player.shirtNumber);
    }

    const liberos = players.filter((player) => player.isLibero).length;
    const maxLiberos = getMaxLiberosPerRoster();
    if (liberos > maxLiberos) {
        return withRulesContext(`${teamLabel} roster cannot have more than ${maxLiberos} liberos.`);
    }

    const captains = players.filter((player) => player.isCaptain).length;
    if (captains > 1) {
        return `${teamLabel} roster cannot have more than 1 captain.`;
    }

    const usedBenchRoles = new Set();
    for (const player of roster) {
        if (!player.name) {
            return `${teamLabel} roster entry name is required.`;
        }
        if (!player.isPlayer && !player.benchRole) {
            return `${teamLabel} non-player entries must have a bench role.`;
        }
        if (player.isPlayer && (!Number.isInteger(player.shirtNumber) || player.shirtNumber <= 0)) {
            return `${teamLabel} player entries must have a positive shirt number.`;
        }
        if (!player.isPlayer && player.isLibero) {
            return `${teamLabel} libero entries must be players.`;
        }
        if (!player.isPlayer && player.isCaptain) {
            return `${teamLabel} captain entries must be players.`;
        }
        if (!mygame.fixture.rules.allowPlayerStaffRoleCumulation && player.isPlayer && player.benchRole) {
            return withRulesContext(`${teamLabel} entries cannot be both player and bench staff under the current rules.`);
        }
        if (player.benchRole) {
            if (usedBenchRoles.has(player.benchRole)) {
                return `${teamLabel} roster cannot have more than one ${player.benchRole}.`;
            }
            usedBenchRoles.add(player.benchRole);
        }
    }

    return '';
}

function clearRosterInputs(teamSide) {
    const controls = getRosterInputs(teamSide);
    controls.nameInput.value = '';
    controls.isPlayerInput.checked = true;
    controls.numberInput.value = '';
    controls.regInput.value = '';
    controls.benchRoleInput.value = '';
    controls.liberoInput.checked = false;
    controls.captainInput.checked = false;
    setupState.editingRosterPlayerId[teamSide] = '';
    syncRosterEntryFormState(teamSide);
    renderRoster(teamSide);
}

function addRosterPlayer(teamSide) {
    if (setupState.matchStarted) {
        return;
    }
    if (!setupState.rulesConfirmed) {
        setTeamDetailsFeedback('Confirm rules before adding roster players.', 'error');
        return;
    }

    const controls = getRosterInputs(teamSide);
    const roster = setupState.rosters[teamSide];
    const editingId = setupState.editingRosterPlayerId[teamSide];
    const playerCount = roster.filter((player) => player.isPlayer).length;

    if (!editingId && controls.isPlayerInput.checked && playerCount >= getMaxRosterPlayers()) {
        setTeamDetailsFeedback(withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster is at max size for current rules.`), 'error');
        return;
    }

    const name = controls.nameInput.value.trim();
    const isPlayer = controls.isPlayerInput.checked;
    const shirtNumber = Number.parseInt(controls.numberInput.value, 10);
    const regNumber = controls.regInput.value.trim();
    const benchRole = normalizeBenchRole(controls.benchRoleInput.value);
    const isLibero = isPlayer && controls.liberoInput.checked;
    const isCaptain = isPlayer && controls.captainInput.checked;

    if (!name) {
        setTeamDetailsFeedback('Name is required.', 'error');
        return;
    }
    if (isPlayer && (!Number.isInteger(shirtNumber) || shirtNumber <= 0)) {
        setTeamDetailsFeedback('Shirt number must be a positive integer.', 'error');
        return;
    }
    const duplicateNumber = isPlayer && roster.some((player) => player.isPlayer && player.shirtNumber === shirtNumber && player.id !== editingId);
    if (duplicateNumber) {
        setTeamDetailsFeedback(`Shirt number ${shirtNumber} is already used in ${teamSide} roster.`, 'error');
        return;
    }

    const rosterForValidation = editingId
        ? roster.map((player) => (player.id === editingId
            ? {
                ...player,
                name,
                shirtNumber: isPlayer ? shirtNumber : null,
                regNumber,
                isPlayer,
                isLibero,
                isCaptain,
                benchRole
            }
            : player))
        : [...roster, {
            id: `p_${setupState.nextRosterPlayerId}`,
            name,
            shirtNumber: isPlayer ? shirtNumber : null,
            regNumber,
            isPlayer,
            isLibero,
            isCaptain,
            benchRole
        }];

    if (isCaptain) {
        for (const player of rosterForValidation) {
            if (editingId && player.id === editingId) {
                continue;
            }
            player.isCaptain = false;
        }
    }

    const entryValidationError = validateRosterEntryForTeam(teamSide, rosterForValidation);
    if (entryValidationError) {
        setTeamDetailsFeedback(entryValidationError, 'error');
        return;
    }

    if (editingId) {
        setupState.rosters[teamSide] = rosterForValidation;
    } else {
        roster.push({
            id: `p_${setupState.nextRosterPlayerId++}`,
            name,
            shirtNumber: isPlayer ? shirtNumber : null,
            regNumber,
            isPlayer,
            isLibero,
            isCaptain,
            benchRole
        });
    }

    markTeamDetailsDirty();
    renderRosters();
    clearRosterInputs(teamSide);
    const updatedRoster = setupState.rosters[teamSide];
    const players = updatedRoster.filter((player) => player.isPlayer);
    const liberos = players.filter((player) => player.isLibero).length;
    const minLiberosAtThirteen = getMinLiberosIfThirteen();
    const unmetThirteenRule = players.length >= 13 && liberos < minLiberosAtThirteen;
    if (unmetThirteenRule) {
        setTeamDetailsFeedback(
            withRulesContext(
                `${teamSide === 'home' ? 'Home' : 'Away'} roster can still be edited, but currently needs ${minLiberosAtThirteen} libero(s) at 13 players before Team Details can be applied.`
            ),
            ''
        );
    } else {
        setTeamDetailsFeedback(
            `${teamSide === 'home' ? 'Home' : 'Away'} entry ${editingId ? 'updated' : 'added'}. Click Apply Team Details when ready.`,
            ''
        );
    }
    updateSetupBadge();
    updateActionAvailability();
}

function editRosterPlayer(teamSide, playerId) {
    if (setupState.matchStarted) {
        return;
    }

    const roster = setupState.rosters[teamSide];
    const player = roster.find((item) => item.id === playerId);
    if (!player) {
        return;
    }

    const controls = getRosterInputs(teamSide);
    controls.nameInput.value = player.name;
    controls.isPlayerInput.checked = Boolean(player.isPlayer);
    controls.numberInput.value = player.shirtNumber || '';
    controls.regInput.value = player.regNumber || '';
    controls.benchRoleInput.value = player.benchRole || '';
    controls.liberoInput.checked = Boolean(player.isLibero);
    controls.captainInput.checked = Boolean(player.isCaptain);

    setupState.editingRosterPlayerId[teamSide] = playerId;
    syncRosterEntryFormState(teamSide);
    renderRoster(teamSide);
    setTeamDetailsFeedback(`${teamSide === 'home' ? 'Home' : 'Away'} entry loaded for edit. Update fields and click Save.`, '');
    updateActionAvailability();
}

function removeRosterPlayer(teamSide, playerId) {
    if (setupState.matchStarted) {
        return;
    }

    const roster = setupState.rosters[teamSide];
    const nextRoster = roster.filter((player) => player.id !== playerId);
    if (nextRoster.length === roster.length) {
        return;
    }

    setupState.rosters[teamSide] = nextRoster;
    if (setupState.editingRosterPlayerId[teamSide] === playerId) {
        setupState.editingRosterPlayerId[teamSide] = '';
    }
    markTeamDetailsDirty();
    renderRosters();
    setTeamDetailsFeedback('Roster updated. Click Apply Team Details to confirm.', '');
    updateSetupBadge();
    updateActionAvailability();
}

function getCurrentSetNumberForLineup() {
    const current = mygame.getCurrentSet();
    return current > 0 ? current : 1;
}

function getLineupSelectElements(teamId) {
    if (teamId === 'teamA') {
        return [
            elements.lineupTeamAPos1,
            elements.lineupTeamAPos2,
            elements.lineupTeamAPos3,
            elements.lineupTeamAPos4,
            elements.lineupTeamAPos5,
            elements.lineupTeamAPos6
        ];
    }

    return [
        elements.lineupTeamBPos1,
        elements.lineupTeamBPos2,
        elements.lineupTeamBPos3,
        elements.lineupTeamBPos4,
        elements.lineupTeamBPos5,
        elements.lineupTeamBPos6
    ];
}

function getAllLineupSelectElements() {
    return [
        ...getLineupSelectElements('teamA'),
        ...getLineupSelectElements('teamB')
    ];
}

function getRosterForTeamId(teamId) {
    const homeOrAway = teamId === 'teamA' ? mygame.teamA : mygame.teamB;
    if (homeOrAway !== 'home' && homeOrAway !== 'away') {
        return [];
    }
    return setupState.rosters[homeOrAway] || [];
}

function getNonLiberoRosterForTeamId(teamId) {
    return getRosterForTeamId(teamId).filter((player) => player.isPlayer && !player.isLibero);
}

function isCurrentSetInProgress() {
    return mygame.currentSet.teamA > 0 || mygame.currentSet.teamB > 0;
}

function ensureLineupStateForCurrentSet() {
    const setNumber = getCurrentSetNumberForLineup();
    if (!setupState.lineupsBySet[setNumber]) {
        setupState.lineupsBySet[setNumber] = {
            confirmed: false,
            started: false,
            locked: false,
            teamA: {},
            teamB: {}
        };
    } else {
        const lineupState = setupState.lineupsBySet[setNumber];
        if (typeof lineupState.confirmed !== 'boolean') {
            lineupState.confirmed = false;
        }
        if (typeof lineupState.locked !== 'boolean') {
            lineupState.locked = false;
        }
        if (typeof lineupState.started !== 'boolean') {
            lineupState.started = Boolean(lineupState.locked);
        }
        if (!lineupState.teamA || typeof lineupState.teamA !== 'object') {
            lineupState.teamA = {};
        }
        if (!lineupState.teamB || typeof lineupState.teamB !== 'object') {
            lineupState.teamB = {};
        }
    }
    return setupState.lineupsBySet[setNumber];
}

function sanitizeLineupSelections(teamId, lineupSelections) {
    const validIds = new Set(getNonLiberoRosterForTeamId(teamId).map((player) => player.id));
    const nextSelections = {};
    let changed = false;

    for (let position = 1; position <= 6; position++) {
        const selectedId = lineupSelections[position] || '';
        if (!selectedId || !validIds.has(selectedId)) {
            nextSelections[position] = '';
            if (selectedId) {
                changed = true;
            }
            continue;
        }
        nextSelections[position] = selectedId;
    }

    return { nextSelections, changed };
}

function resetLineupsState() {
    setupState.lineupsBySet = {};
    setupState.lineupPromptedSet = 0;
    setLineupsFeedback('', '');
}

function currentSetLineupConfirmed() {
    if (!setupState.prematchTossConfirmed || mygame.isGameOver) {
        return false;
    }
    const lineupState = ensureLineupStateForCurrentSet();
    return Boolean(lineupState.confirmed);
}

function currentSetStarted() {
    if (!setupState.matchStarted || mygame.isGameOver) {
        return false;
    }
    const lineupState = ensureLineupStateForCurrentSet();
    return Boolean(lineupState.started);
}

function markCurrentSetStarted() {
    if (mygame.isGameOver) {
        return;
    }
    const lineupState = ensureLineupStateForCurrentSet();
    lineupState.started = true;
    lineupState.locked = true;
}

function buildLineupOptionLabel(player) {
    return `#${player.shirtNumber} (${player.name})`;
}

function getLineupOptionSuffix(teamSelections, currentPosition, playerId) {
    let selectedPosition = 0;
    for (let position = 1; position <= 6; position++) {
        if (teamSelections[position] === playerId) {
            selectedPosition = position;
            break;
        }
    }

    if (!selectedPosition) {
        return '+';
    }
    if (selectedPosition !== currentPosition) {
        return `⇄ P${selectedPosition}`;
    }
    return `= P${selectedPosition}`;
}

function getSelectedLineupPosition(teamSelections, playerId) {
    for (let position = 1; position <= 6; position++) {
        if (teamSelections[position] === playerId) {
            return position;
        }
    }
    return 0;
}

function getLineupDisplaySides() {
    if (mygame.onLeft === true) {
        return { leftTeamId: 'teamA', rightTeamId: 'teamB' };
    }
    if (mygame.onLeft === false) {
        return { leftTeamId: 'teamB', rightTeamId: 'teamA' };
    }
    return { leftTeamId: 'teamA', rightTeamId: 'teamB' };
}

function updateLineupsPanelTeamOrder() {
    const { leftTeamId, rightTeamId } = getLineupDisplaySides();
    const teamAIsLeft = leftTeamId === 'teamA';

    elements.lineupsTeamACard.style.order = teamAIsLeft ? '2' : '3';
    elements.lineupsTeamBCard.style.order = teamAIsLeft ? '3' : '2';

    elements.lineupsTeamATitle.textContent = `${getTeamLabelOrFallback('teamA')} Lineup (${teamAIsLeft ? 'Left' : 'Right'})`;
    elements.lineupsTeamBTitle.textContent = `${getTeamLabelOrFallback('teamB')} Lineup (${rightTeamId === 'teamB' ? 'Right' : 'Left'})`;
}

function renderLineupSelect(teamId, position, selectedPlayerId, disabled) {
    const select = getLineupSelectElements(teamId)[position - 1];
    const roster = getNonLiberoRosterForTeamId(teamId);
    const lineupState = ensureLineupStateForCurrentSet();
    const teamSelections = lineupState[teamId] || {};
    const sortedRoster = [...roster].sort((playerA, playerB) => {
        const selectedPosA = getSelectedLineupPosition(teamSelections, playerA.id);
        const selectedPosB = getSelectedLineupPosition(teamSelections, playerB.id);
        const isFreeA = selectedPosA === 0;
        const isFreeB = selectedPosB === 0;

        if (isFreeA !== isFreeB) {
            return isFreeA ? -1 : 1;
        }

        if (!isFreeA && selectedPosA !== selectedPosB) {
            return selectedPosA - selectedPosB;
        }

        if (playerA.shirtNumber !== playerB.shirtNumber) {
            return playerA.shirtNumber - playerB.shirtNumber;
        }

        return playerA.name.localeCompare(playerB.name);
    });
    select.innerHTML = '';

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select player';
    select.appendChild(placeholderOption);

    for (const player of sortedRoster) {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `${buildLineupOptionLabel(player)}  ${getLineupOptionSuffix(teamSelections, position, player.id)}`;
        select.appendChild(option);
    }

    select.value = selectedPlayerId || '';
    select.disabled = disabled;
}

function renderLineupsPanel() {
    const setNumber = getCurrentSetNumberForLineup();
    elements.lineupsSetLabel.textContent = `Set ${setNumber}`;
    updateLineupsPanelTeamOrder();
    const lineupState = ensureLineupStateForCurrentSet();
    const sanitizedA = sanitizeLineupSelections('teamA', lineupState.teamA);
    const sanitizedB = sanitizeLineupSelections('teamB', lineupState.teamB);
    if (sanitizedA.changed || sanitizedB.changed) {
        lineupState.teamA = sanitizedA.nextSelections;
        lineupState.teamB = sanitizedB.nextSelections;
        lineupState.confirmed = false;
        lineupState.started = false;
        if (!lineupState.locked) {
            setLineupsFeedback('Lineup selections were updated to match current eligible roster players.', '');
        }
    } else {
        lineupState.teamA = sanitizedA.nextSelections;
        lineupState.teamB = sanitizedB.nextSelections;
    }

    const readOnly = lineupState.locked || mygame.isGameOver || !setupState.prematchTossConfirmed;

    for (let position = 1; position <= 6; position++) {
        renderLineupSelect('teamA', position, lineupState.teamA[position] || '', readOnly);
        renderLineupSelect('teamB', position, lineupState.teamB[position] || '', readOnly);
    }
}

function getLineupSelectionsFromForm(teamId) {
    const selections = {};
    const selects = getLineupSelectElements(teamId);
    for (let i = 0; i < selects.length; i++) {
        selections[i + 1] = selects[i].value;
    }
    return selections;
}

function validateLineupForTeam(teamId, lineupSelections) {
    const teamLabel = teamId === 'teamA' ? 'Team A' : 'Team B';
    const roster = getNonLiberoRosterForTeamId(teamId);
    const allowedIds = new Set(roster.map((player) => player.id));

    for (let position = 1; position <= 6; position++) {
        const playerId = lineupSelections[position];
        if (!playerId) {
            return `${teamLabel}: every position from 1 to 6 must be filled.`;
        }
        if (!allowedIds.has(playerId)) {
            return `${teamLabel}: selected player at position ${position} is invalid or is a libero.`;
        }
    }

    const selectedIds = Object.values(lineupSelections);
    if (new Set(selectedIds).size !== 6) {
        return `${teamLabel}: the same player cannot be used in multiple positions.`;
    }

    return '';
}

function applyLineupsForCurrentSet() {
    if (!setupState.prematchTossConfirmed || mygame.isGameOver) {
        setLineupsFeedback('Apply prematch toss choices before setting lineups.', 'error');
        return;
    }

    const lineupState = ensureLineupStateForCurrentSet();
    if (lineupState.locked) {
        setLineupsFeedback('Lineups are locked for this set because scoring already started.', 'error');
        return;
    }

    const teamALineup = getLineupSelectionsFromForm('teamA');
    const teamBLineup = getLineupSelectionsFromForm('teamB');

    const teamAError = validateLineupForTeam('teamA', teamALineup);
    if (teamAError) {
        setLineupsFeedback(teamAError, 'error');
        return;
    }

    const teamBError = validateLineupForTeam('teamB', teamBLineup);
    if (teamBError) {
        setLineupsFeedback(teamBError, 'error');
        return;
    }

    lineupState.teamA = { ...teamALineup };
    lineupState.teamB = { ...teamBLineup };
    lineupState.confirmed = true;
    lineupState.started = false;
    lineupState.locked = false;
    mygame.addExternalEvent('lineups_applied', {
        setNumber: getCurrentSetNumberForLineup(),
        teamA: { ...teamALineup },
        teamB: { ...teamBLineup },
        duringMatch: setupState.matchStarted
    });
    setLineupsFeedback(`Set ${getCurrentSetNumberForLineup()} lineup staged. Click Start Set when ready.`, 'success');
    updateSetsElements();
}

function getLineupIdentityFromSelect(selectElement) {
    const id = selectElement.id || '';
    const match = id.match(/^lineup-(teamA|teamB)-pos([1-6])$/);
    if (!match) {
        return null;
    }
    return {
        teamId: match[1],
        position: Number.parseInt(match[2], 10)
    };
}

function markLineupDirtyFromFormChange(changedSelect = null) {
    if (!setupState.prematchTossConfirmed || mygame.isGameOver) {
        return;
    }
    const lineupState = ensureLineupStateForCurrentSet();
    if (lineupState.locked) {
        return;
    }

    if (changedSelect) {
        const identity = getLineupIdentityFromSelect(changedSelect);
        if (identity) {
            const teamSelections = getLineupSelectionsFromForm(identity.teamId);
            const selectedPlayerId = teamSelections[identity.position] || '';
            const previousAtChangedPosition = lineupState[identity.teamId][identity.position] || '';

            if (selectedPlayerId) {
                for (let position = 1; position <= 6; position++) {
                    if (position === identity.position) {
                        continue;
                    }
                    if (teamSelections[position] === selectedPlayerId) {
                        teamSelections[position] = previousAtChangedPosition && previousAtChangedPosition !== selectedPlayerId
                            ? previousAtChangedPosition
                            : '';
                        break;
                    }
                }
            }

            lineupState[identity.teamId] = teamSelections;
        }
    } else {
        lineupState.teamA = getLineupSelectionsFromForm('teamA');
        lineupState.teamB = getLineupSelectionsFromForm('teamB');
    }

    if (lineupState.confirmed) {
        lineupState.confirmed = false;
        lineupState.started = false;
        lineupState.locked = false;
        setLineupsFeedback('Lineups changed. Click Apply Lineups For Set to stage them again.', '');
    }
}

function padTimePart(value) {
    return String(value).padStart(2, '0');
}

function formatTimeFromDate(date) {
    return `${padTimePart(date.getHours())}:${padTimePart(date.getMinutes())}`;
}

function parseTimeToDate(timeValue) {
    if (typeof timeValue !== 'string') {
        return null;
    }
    const match = timeValue.match(/^(\d{2}):(\d{2})$/);
    if (!match) {
        return null;
    }
    const date = new Date();
    date.setSeconds(0, 0);
    date.setHours(Number.parseInt(match[1], 10), Number.parseInt(match[2], 10), 0, 0);
    return date;
}

function getRoundedCurrentTimeString() {
    const date = new Date();
    const shouldRoundUp = date.getSeconds() >= 30;
    date.setSeconds(0, 0);
    if (shouldRoundUp) {
        date.setMinutes(date.getMinutes() + 1);
    }
    return formatTimeFromDate(date);
}

function addMinutesToTimeString(timeValue, minutesToAdd) {
    const date = parseTimeToDate(timeValue);
    if (!date) {
        return '';
    }
    date.setMinutes(date.getMinutes() + minutesToAdd);
    return formatTimeFromDate(date);
}

function getLaterTimeString(timeValueA, timeValueB) {
    const dateA = parseTimeToDate(timeValueA);
    const dateB = parseTimeToDate(timeValueB);
    if (!dateA && !dateB) {
        return '';
    }
    if (!dateA) {
        return timeValueB || '';
    }
    if (!dateB) {
        return timeValueA || '';
    }
    return dateA >= dateB ? timeValueA : timeValueB;
}

function getSetTimeEntry(setNumber) {
    if (!mygame.history?.placeholders?.setTimes) {
        return null;
    }
    return mygame.history.placeholders.setTimes.find((entry) => entry.setNumber === setNumber) || null;
}

function getOfficialAndActualStartTimesForSet(setNumber) {
    const actualStartTime = getRoundedCurrentTimeString();
    if (setNumber <= 1) {
        return {
            startTime: actualStartTime,
            actualStartTime
        };
    }

    const previousEntry = getSetTimeEntry(setNumber - 1);
    if (!previousEntry || !previousEntry.endTime) {
        return {
            startTime: actualStartTime,
            actualStartTime
        };
    }

    return {
        startTime: addMinutesToTimeString(previousEntry.endTime, mygame.fixture.rules.breakBetweenSetsMins) || actualStartTime,
        actualStartTime
    };
}

function asPositiveInteger(value, fieldName, minValue = 1) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < minValue) {
        throw new Error(`${fieldName} must be an integer >= ${minValue}.`);
    }
    return parsed;
}

function normalizeRulesValues(rawValues) {
    const normalized = {
        regsetpts: asPositiveInteger(rawValues.regsetpts, 'Regular set points'),
        nbsetswin: asPositiveInteger(rawValues.nbsetswin, 'Sets to win', 1),
        decidersetpts: asPositiveInteger(rawValues.decidersetpts, 'Decider set points'),
        ptsdiffwinpts: asPositiveInteger(rawValues.ptsdiffwinpts, 'Points diff for interrupted match', 0),
        ptsdiffwinset: asPositiveInteger(rawValues.ptsdiffwinset, 'Points diff to win set'),
        swapsidesindecider: Boolean(rawValues.swapsidesindecider),
        nbptsforswap: asPositiveInteger(rawValues.nbptsforswap, 'Points for side swap'),
        maxnumberplayers: asPositiveInteger(rawValues.maxnumberplayers, 'Max players'),
        minliberoifthirteen: asPositiveInteger(rawValues.minliberoifthirteen, 'Min liberos if 13 players', 0),
        breakBetweenSetsMins: asPositiveInteger(rawValues.breakBetweenSetsMins ?? 3, 'Official break between sets', 0),
        allowPlayerStaffRoleCumulation: Boolean(rawValues.allowPlayerStaffRoleCumulation)
    };

    if (normalized.nbptsforswap > normalized.decidersetpts) {
        throw new Error('Points for side swap cannot be greater than decider set points.');
    }

    return normalized;
}

function parseProfileSelection(selectedProfileValue) {
    if (selectedProfileValue === 'custom') {
        return { type: 'custom' };
    }

    if (selectedProfileValue.startsWith('preset:')) {
        const presetId = selectedProfileValue.replace('preset:', '');
        const preset = RULE_PRESETS[presetId];
        if (!preset) {
            return { type: 'unknown' };
        }
        return { type: 'preset', id: presetId, label: preset.label, values: preset.values };
    }

    if (selectedProfileValue.startsWith('saved:')) {
        const savedId = selectedProfileValue.replace('saved:', '');
        const savedProfile = savedRuleProfiles.find((profile) => profile.id === savedId);
        if (!savedProfile) {
            return { type: 'unknown' };
        }
        return { type: 'saved', id: savedId, label: savedProfile.name, values: savedProfile.values };
    }

    return { type: 'unknown' };
}

function persistSavedRuleProfiles() {
    const payload = {
        version: 1,
        profiles: savedRuleProfiles
    };
    localStorage.setItem(RULE_PROFILE_STORAGE_KEY, JSON.stringify(payload));
}

function loadSavedRuleProfiles() {
    savedRuleProfiles = [];
    const raw = localStorage.getItem(RULE_PROFILE_STORAGE_KEY);
    if (!raw) {
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        const profiles = Array.isArray(parsed.profiles) ? parsed.profiles : [];
        for (const profile of profiles) {
            if (!profile || typeof profile.id !== 'string' || typeof profile.name !== 'string') {
                continue;
            }
            try {
                const values = normalizeRulesValues(profile.values || {});
                const trimmedName = profile.name.trim();
                if (!trimmedName) {
                    continue;
                }
                savedRuleProfiles.push({
                    id: profile.id,
                    name: trimmedName,
                    values
                });
            } catch {
                continue;
            }
        }
    } catch {
        savedRuleProfiles = [];
    }
}

function rebuildRulesProfileOptions(selectedValue = 'custom') {
    const currentValue = selectedValue || elements.rulesProfile.value;
    elements.rulesProfile.innerHTML = '';

    for (const presetId of Object.keys(RULE_PRESETS)) {
        const presetOption = document.createElement('option');
        presetOption.value = `preset:${presetId}`;
        presetOption.textContent = RULE_PRESETS[presetId].label;
        elements.rulesProfile.appendChild(presetOption);
    }

    for (const profile of savedRuleProfiles) {
        const savedOption = document.createElement('option');
        savedOption.value = `saved:${profile.id}`;
        savedOption.textContent = `Saved: ${profile.name}`;
        elements.rulesProfile.appendChild(savedOption);
    }

    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom';
    elements.rulesProfile.appendChild(customOption);

    const hasSelection = Array.from(elements.rulesProfile.options).some((option) => option.value === currentValue);
    elements.rulesProfile.value = hasSelection ? currentValue : DEFAULT_PROFILE_ID;
}

function getPresetSummaryLine(values) {
    return [
        `Regular: ${values.regsetpts} pts`,
        `Sets to win: ${values.nbsetswin}`,
        `Decider: ${values.decidersetpts} pts`,
        `Swap in decider: ${values.swapsidesindecider ? 'Yes' : 'No'}`,
        `Min libero if 13: ${values.minliberoifthirteen}`,
        `Break between sets: ${values.breakBetweenSetsMins} min`,
        `Player/staff cumulation: ${values.allowPlayerStaffRoleCumulation ? 'Allowed' : 'Not allowed'}`
    ].join(' | ');
}

function setRulesFormValues(ruleValues) {
    elements.regsetpts.value = ruleValues.regsetpts;
    elements.nbsetswin.value = ruleValues.nbsetswin;
    elements.decidersetpts.value = ruleValues.decidersetpts;
    elements.ptsdiffwinpts.value = ruleValues.ptsdiffwinpts;
    elements.ptsdiffwinset.value = ruleValues.ptsdiffwinset;
    elements.swapsidesindecider.checked = ruleValues.swapsidesindecider;
    elements.nbptsforswap.value = ruleValues.nbptsforswap;
    elements.maxnumberplayers.value = ruleValues.maxnumberplayers;
    elements.minliberoifthirteen.value = ruleValues.minliberoifthirteen;
    elements.breakBetweenSetsMins.value = ruleValues.breakBetweenSetsMins;
    elements.allowPlayerStaffRoleCumulation.checked = Boolean(ruleValues.allowPlayerStaffRoleCumulation);
}

function getRulesFromForm() {
    return normalizeRulesValues({
        regsetpts: elements.regsetpts.value,
        nbsetswin: elements.nbsetswin.value,
        decidersetpts: elements.decidersetpts.value,
        ptsdiffwinpts: elements.ptsdiffwinpts.value,
        ptsdiffwinset: elements.ptsdiffwinset.value,
        swapsidesindecider: elements.swapsidesindecider.checked,
        nbptsforswap: elements.nbptsforswap.value,
        maxnumberplayers: elements.maxnumberplayers.value,
        minliberoifthirteen: elements.minliberoifthirteen.value,
        breakBetweenSetsMins: elements.breakBetweenSetsMins.value,
        allowPlayerStaffRoleCumulation: elements.allowPlayerStaffRoleCumulation.checked
    });
}

function applyRules(ruleValues) {
    mygame.fixture.rules = new Rules(
        ruleValues.regsetpts,
        ruleValues.nbsetswin,
        ruleValues.decidersetpts,
        ruleValues.ptsdiffwinpts,
        ruleValues.ptsdiffwinset,
        ruleValues.swapsidesindecider,
        ruleValues.nbptsforswap,
        ruleValues.maxnumberplayers,
        ruleValues.minliberoifthirteen,
        ruleValues.allowPlayerStaffRoleCumulation,
        ruleValues.breakBetweenSetsMins
    );
}

function updateRulesPanelView() {
    const selectedProfile = parseProfileSelection(elements.rulesProfile.value);
    const isCustom = selectedProfile.type === 'custom';
    const isSavedProfile = selectedProfile.type === 'saved';

    if (isCustom) {
        elements.rulesPresetSummary.textContent = `Custom profile. ${setupState.rulesSource === 'custom' ? 'Saved values are loaded below.' : 'Edit values below and save.'}`;
    } else if (selectedProfile.type === 'preset' || selectedProfile.type === 'saved') {
        elements.rulesPresetSummary.textContent = `${selectedProfile.label}: ${getPresetSummaryLine(selectedProfile.values)}`;
        setRulesFormValues(selectedProfile.values);
    } else {
        elements.rulesPresetSummary.textContent = 'Unknown profile selected.';
    }

    const ruleFieldsReadOnly = setupState.matchStarted || !isCustom;
    for (const input of [
        elements.regsetpts,
        elements.nbsetswin,
        elements.decidersetpts,
        elements.ptsdiffwinpts,
        elements.ptsdiffwinset,
        elements.swapsidesindecider,
        elements.nbptsforswap,
        elements.maxnumberplayers,
        elements.minliberoifthirteen,
        elements.breakBetweenSetsMins,
        elements.allowPlayerStaffRoleCumulation
    ]) {
        input.disabled = ruleFieldsReadOnly;
    }

    elements.saveRulesProfile.disabled = setupState.matchStarted || !isCustom;
    elements.newRulesProfileName.disabled = setupState.matchStarted || !isCustom;
    elements.deleteRulesProfile.disabled = setupState.matchStarted || !isSavedProfile;
    elements.saveCustomRules.disabled = setupState.matchStarted || !isCustom;
}

function updateRulesStatusBadge() {
    elements.rulesStatusBadge.classList.remove('ready', 'locked');

    if (!setupState.rulesConfirmed) {
        elements.rulesStatusBadge.textContent = 'Rules: Not Set';
        return;
    }

    elements.rulesStatusBadge.textContent = `Rules: ${setupState.rulesProfileLabel}`;
    elements.rulesStatusBadge.classList.add('ready');

    if (setupState.matchStarted) {
        elements.rulesStatusBadge.classList.remove('ready');
        elements.rulesStatusBadge.classList.add('locked');
    }
}

function markRulesDirty() {
    if (setupState.matchStarted || elements.rulesProfile.value !== 'custom') {
        return;
    }

    if (setupState.rulesConfirmed && setupState.rulesSource === 'custom') {
        setupState.rulesConfirmed = false;
        setupState.rulesSource = 'none';
        setupState.teamDetailsConfirmed = false;
        setupState.prematchTossConfirmed = false;
        resetLineupsState();
        setRulesFeedback('Custom rules changed. Save custom rules to confirm.', 'error');
    }

    updateRulesStatusBadge();
    updateSetupBadge();
    updateActionAvailability();
}

function getSetupSelections() {
    const leftStarter = document.querySelector('input[name="setup-left-starter"]:checked');
    const firstServer = document.querySelector('input[name="setup-first-server"]:checked');

    return {
        homeName: elements.homeTeamName.value.trim(),
        awayName: elements.awayTeamName.value.trim(),
        leftStarter: leftStarter ? leftStarter.value : '',
        firstServer: firstServer ? firstServer.value : ''
    };
}

function validateTeamDetails() {
    if (!setupState.rulesConfirmed) {
        setTeamDetailsFeedback('Confirm rules first.', 'error');
        return null;
    }

    const homeName = elements.homeTeamName.value.trim();
    const awayName = elements.awayTeamName.value.trim();

    if (!homeName) {
        setTeamDetailsFeedback('Home team name is required.', 'error');
        return null;
    }
    if (!awayName) {
        setTeamDetailsFeedback('Away team name is required.', 'error');
        return null;
    }

    const homeRosterError = validateRosterForTeam('home', setupState.rosters.home);
    if (homeRosterError) {
        setTeamDetailsFeedback(homeRosterError, 'error');
        return null;
    }

    const awayRosterError = validateRosterForTeam('away', setupState.rosters.away);
    if (awayRosterError) {
        setTeamDetailsFeedback(awayRosterError, 'error');
        return null;
    }

    return {
        homeName,
        awayName,
        homeRoster: setupState.rosters.home.map((player) => ({ ...player })),
        awayRoster: setupState.rosters.away.map((player) => ({ ...player }))
    };
}

function hasReadySelections() {
    return setupState.rulesConfirmed && setupState.teamDetailsConfirmed && setupState.prematchTossConfirmed && currentSetLineupConfirmed();
}

function validateBeforeSetStart() {
    const currentSetNumber = getCurrentSetNumberForLineup();

    if (!setupState.matchStarted) {
        if (!setupState.rulesConfirmed) {
            setSetupFeedback('Rules are required. Apply a preset or save custom rules first.', 'error');
            return null;
        }
        if (!setupState.teamDetailsConfirmed) {
            setSetupFeedback('Apply team details and rosters before starting Set 1.', 'error');
            return null;
        }
        if (!setupState.prematchTossConfirmed) {
            setSetupFeedback('Apply prematch toss choices before starting Set 1.', 'error');
            return null;
        }
    }

    if (mygame.isPreDeciderToss) {
        setSetupFeedback('Apply decider toss choices before starting the next set.', 'error');
        return null;
    }

    if (!currentSetLineupConfirmed()) {
        setSetupFeedback(`Apply lineups for Set ${currentSetNumber} before starting it.`, 'error');
        return null;
    }

    return getSetupSelections();
}

function validatePrematchSelections() {
    if (!setupState.rulesConfirmed) {
        setSetupFeedback('Rules must be confirmed before applying prematch toss choices.', 'error');
        return null;
    }
    if (!setupState.teamDetailsConfirmed) {
        setSetupFeedback('Apply team details before prematch toss choices.', 'error');
        return null;
    }

    const selections = getSetupSelections();
    if (!selections.homeName) {
        setSetupFeedback('Home team name is required.', 'error');
        return null;
    }
    if (!selections.awayName) {
        setSetupFeedback('Away team name is required.', 'error');
        return null;
    }
    if (!selections.leftStarter) {
        setSetupFeedback('Select whether home or away starts on the left side.', 'error');
        return null;
    }
    if (!selections.firstServer) {
        setSetupFeedback('Select which team serves first.', 'error');
        return null;
    }

    return selections;
}

function lockPrematchSetup() {
    setupState.setupLocked = true;

    const prematchInputs = [
        elements.homeTeamName,
        elements.awayTeamName,
        elements.rulesProfile,
        elements.regsetpts,
        elements.nbsetswin,
        elements.decidersetpts,
        elements.ptsdiffwinpts,
        elements.ptsdiffwinset,
        elements.swapsidesindecider,
        elements.nbptsforswap,
        elements.maxnumberplayers,
        elements.minliberoifthirteen,
        elements.breakBetweenSetsMins,
        elements.allowPlayerStaffRoleCumulation
    ];

    for (const input of prematchInputs) {
        input.disabled = true;
    }

    for (const input of [
        elements.homePlayerName,
        elements.homePlayerIsPlayer,
        elements.homePlayerNumber,
        elements.homePlayerRegNumber,
        elements.homePlayerBenchRole,
        elements.homePlayerLibero,
        elements.homePlayerCaptain,
        elements.awayPlayerName,
        elements.awayPlayerIsPlayer,
        elements.awayPlayerNumber,
        elements.awayPlayerRegNumber,
        elements.awayPlayerBenchRole,
        elements.awayPlayerLibero,
        elements.awayPlayerCaptain
    ]) {
        input.disabled = true;
    }

    for (const radio of document.querySelectorAll('input[name="setup-left-starter"], input[name="setup-first-server"]')) {
        radio.disabled = true;
    }

    elements.applyRulesProfile.disabled = true;
    elements.saveCustomRules.disabled = true;
    elements.saveRulesProfile.disabled = true;
    elements.deleteRulesProfile.disabled = true;
    elements.newRulesProfileName.disabled = true;
    elements.applyTeamDetails.disabled = true;
    elements.applyPrematchToss.disabled = true;
    elements.addHomePlayer.disabled = true;
    elements.addAwayPlayer.disabled = true;
    elements.importRulesJson.disabled = true;
    elements.importHomeRosterJson.disabled = true;
    elements.importAwayRosterJson.disabled = true;
    renderRosters();
}

function updateSetupBadge() {
    elements.setupStatusBadge.classList.remove('ready', 'locked');
    const deciderTossRequired = setupState.matchStarted && !mygame.isGameOver && mygame.isPreDeciderToss;
    const lineupRequired = setupState.prematchTossConfirmed && !mygame.isGameOver && !currentSetLineupConfirmed();
    const setReadyToStart = setupState.prematchTossConfirmed && !mygame.isGameOver && currentSetLineupConfirmed() && !currentSetStarted();

    if (deciderTossRequired) {
        elements.setupStatusBadge.textContent = 'Decider Toss Required';
        elements.setupStatusBadge.classList.add('locked');
        return;
    }

    if (setupState.matchStarted) {
        if (lineupRequired) {
            elements.setupStatusBadge.textContent = `Lineups Required (Set ${getCurrentSetNumberForLineup()})`;
            elements.setupStatusBadge.classList.add('locked');
            return;
        }
        if (setReadyToStart) {
            elements.setupStatusBadge.textContent = `Ready To Start Set ${getCurrentSetNumberForLineup()}`;
            elements.setupStatusBadge.classList.add('ready');
            return;
        }
        elements.setupStatusBadge.textContent = 'Set In Progress';
        elements.setupStatusBadge.classList.add('locked');
        return;
    }

    if (setReadyToStart) {
        elements.setupStatusBadge.textContent = 'Ready To Start Set 1';
        elements.setupStatusBadge.classList.add('ready');
        return;
    }

    if (lineupRequired) {
        elements.setupStatusBadge.textContent = `Prematch done, Lineups Pending (Set ${getCurrentSetNumberForLineup()})`;
        return;
    }

    if (hasReadySelections()) {
        elements.setupStatusBadge.textContent = `Ready (${setupState.rulesProfileLabel})`;
        elements.setupStatusBadge.classList.add('ready');
        return;
    }

    if (setupState.rulesConfirmed && !setupState.teamDetailsConfirmed) {
        elements.setupStatusBadge.textContent = `Rules Set (${setupState.rulesProfileLabel}), Team Details/Rosters Pending`;
        return;
    }

    if (setupState.rulesConfirmed) {
        elements.setupStatusBadge.textContent = `Rules Set (${setupState.rulesProfileLabel}), Toss Choices Pending`;
        return;
    }

    elements.setupStatusBadge.textContent = 'Toss Choices Incomplete';
}

function updateTeamPosition() {
    if (mygame.onLeft === true) {
        elements.teamsContainer.classList.add('left');
        elements.teamsContainer.classList.remove('right');
        return;
    }

    if (mygame.onLeft === false) {
        elements.teamsContainer.classList.add('right');
        elements.teamsContainer.classList.remove('left');
    }
}

function getTeamLabelOrFallback(teamId) {
    const name = mygame.getTeamName(teamId);
    if (name && name !== 'Unknown') {
        return name;
    }

    return teamId === 'teamA' ? 'Team A' : 'Team B';
}

function updateScoringServingValues() {
    elements.teamAName.textContent = getTeamLabelOrFallback('teamA');
    elements.teamBName.textContent = getTeamLabelOrFallback('teamB');

    elements.scoreTeamA.textContent = mygame.currentSet.teamA;
    elements.scoreTeamB.textContent = mygame.currentSet.teamB;
    elements.setsTeamA.textContent = mygame.setWins.teamA;
    elements.setsTeamB.textContent = mygame.setWins.teamB;
    elements.pointsTeamA.textContent = mygame.totalPoints.teamA;
    elements.pointsTeamB.textContent = mygame.totalPoints.teamB;

    elements.servingStateTeamA.textContent = mygame.servingstate.teamA;
    elements.servingStateTeamB.textContent = mygame.servingstate.teamB;

    if (!setupState.matchStarted) {
        if (setupState.prematchTossConfirmed && !currentSetLineupConfirmed()) {
            elements.gameStatus.textContent = 'Set 1 lineups required before starting play.';
        } else if (setupState.prematchTossConfirmed && currentSetLineupConfirmed()) {
            elements.gameStatus.textContent = 'Set 1 lineup staged. Click Start Set to begin play.';
        } else {
            elements.gameStatus.textContent = 'Toss choices required before match start.';
        }
    } else if (!currentSetLineupConfirmed() && !mygame.isGameOver) {
            elements.gameStatus.textContent = `Set ${getCurrentSetNumberForLineup()} lineups are required before starting play.`;
    } else if (!currentSetStarted() && !mygame.isGameOver) {
        elements.gameStatus.textContent = `Set ${getCurrentSetNumberForLineup()} lineup staged. Click Start Set to begin play.`;
    } else {
        elements.gameStatus.textContent = mygame.getGameStatus();
    }
}

function updateDeciderTossVisibility() {
    const deciderTossRequired = setupState.matchStarted && !mygame.isGameOver && mygame.isPreDeciderToss;
    const deciderTossAlreadySet = mygame.team_serving_deciderset === 'teamA' || mygame.team_serving_deciderset === 'teamB';
    const showDeciderTossSection = setupState.matchStarted && (deciderTossRequired || deciderTossAlreadySet || mygame.isDeciderSet());

    if (showDeciderTossSection) {
        elements.deciderCard.classList.add('visible');
        if (setupState.deciderLeftStarter) {
            elements.deciderLeftTeam.value = setupState.deciderLeftStarter;
        }

        if (mygame.team_serving_deciderset === 'teamA' || mygame.team_serving_deciderset === 'teamB') {
            elements.deciderServingTeam.value = mygame.team_serving_deciderset;
        }

        const readOnlyConsultation = !deciderTossRequired;
        elements.deciderLeftTeam.disabled = readOnlyConsultation;
        elements.deciderServingTeam.disabled = readOnlyConsultation;

        if (deciderTossRequired) {
            elements.toggleSetupPanel.classList.add('needs-attention');
            elements.setupStatusBadge.classList.add('needs-attention');
            setActivePanel('setup');
            if (!setupState.deciderPromptShown) {
                setSetupFeedback('Decider set reached: please complete pre-decider toss choices.', 'error');
                setupState.deciderPromptShown = true;
            }
        } else {
            elements.toggleSetupPanel.classList.remove('needs-attention');
            elements.setupStatusBadge.classList.remove('needs-attention');
            setupState.deciderPromptShown = false;
        }

        return;
    }

    elements.deciderCard.classList.remove('visible');
    elements.deciderLeftTeam.disabled = false;
    elements.deciderServingTeam.disabled = false;
    elements.toggleSetupPanel.classList.remove('needs-attention');
    elements.setupStatusBadge.classList.remove('needs-attention');
    setupState.deciderPromptShown = false;
}

function updateLineupPromptVisibility() {
    const lineupRequired = setupState.prematchTossConfirmed && !mygame.isGameOver && !currentSetLineupConfirmed();
    const blockedByDeciderToss = setupState.matchStarted && !mygame.isGameOver && mygame.isPreDeciderToss;
    const currentSetNumber = getCurrentSetNumberForLineup();

    if (lineupRequired && !blockedByDeciderToss) {
        elements.toggleLineupsPanel.classList.add('needs-attention');
        if (setupState.lineupPromptedSet !== currentSetNumber) {
            setActivePanel('lineups');
            setupState.lineupPromptedSet = currentSetNumber;
        }
        if (elements.lineupsFeedback.textContent.trim() === '') {
            setLineupsFeedback(`Please apply lineups for Set ${currentSetNumber}.`, '');
        }
        return;
    }

    elements.toggleLineupsPanel.classList.remove('needs-attention');
}

function updateActionAvailability() {
    const lineupState = ensureLineupStateForCurrentSet();
    const canStartSet = !mygame.isGameOver
        && currentSetLineupConfirmed()
        && !lineupState.started
        && (!setupState.matchStarted || !mygame.isPreDeciderToss)
        && (setupState.matchStarted || hasReadySelections());
    elements.startMatch.textContent = `Start Set ${getCurrentSetNumberForLineup()}`;
    elements.startMatch.disabled = !canStartSet;
    elements.applyTeamDetails.disabled = setupState.matchStarted || !setupState.rulesConfirmed;
    elements.applyPrematchToss.disabled = setupState.matchStarted || !setupState.rulesConfirmed || !setupState.teamDetailsConfirmed;
    const homeAtMax = setupState.rosters.home.filter((player) => player.isPlayer).length >= getMaxRosterPlayers();
    const awayAtMax = setupState.rosters.away.filter((player) => player.isPlayer).length >= getMaxRosterPlayers();
    const editingHome = Boolean(setupState.editingRosterPlayerId.home);
    const editingAway = Boolean(setupState.editingRosterPlayerId.away);

    elements.addHomePlayer.disabled = setupState.matchStarted
        || !setupState.rulesConfirmed
        || (homeAtMax && !editingHome && elements.homePlayerIsPlayer.checked);
    elements.addAwayPlayer.disabled = setupState.matchStarted
        || !setupState.rulesConfirmed
        || (awayAtMax && !editingAway && elements.awayPlayerIsPlayer.checked);

    const canManageSet = setupState.matchStarted && !mygame.isGameOver && currentSetStarted();
    const canScore = canManageSet && mygame.team_serving_currently !== 'Unknown';
    const canUndo = canManageSet && mygame.pointHistory.length > 0;
    const canRedo = canManageSet && mygame.redoHistory.length > 0;

    elements.incTeamA.disabled = !canScore;
    elements.incTeamB.disabled = !canScore;
    elements.undoLastPoint.disabled = !canUndo;
    elements.redoLastPoint.disabled = !canRedo;
    elements.completeSet.disabled = !canManageSet;
    elements.completeGame.disabled = !canManageSet;
    const deciderTossRequired = setupState.matchStarted && !mygame.isGameOver && mygame.isPreDeciderToss;
    elements.applyDeciderToss.disabled = !deciderTossRequired;
    elements.applyLineups.disabled = !setupState.prematchTossConfirmed || mygame.isGameOver || lineupState.locked;
    elements.importRulesJson.disabled = setupState.matchStarted;
    elements.importHomeRosterJson.disabled = setupState.matchStarted;
    elements.importAwayRosterJson.disabled = setupState.matchStarted;
    elements.exportRulesJson.disabled = false;
    elements.exportHomeRosterJson.disabled = false;
    elements.exportAwayRosterJson.disabled = false;
}

function updateSetsElements() {
    updateRosterRuleHint();
    renderRosters();
    renderLineupsPanel();
    updateTeamPosition();
    updateScoringServingValues();
    updateDeciderTossVisibility();
    updateLineupPromptVisibility();
    updateSetupBadge();
    updateRulesStatusBadge();
    updateActionAvailability();
}

function applyPresetProfile(profileId) {
    const selection = parseProfileSelection(profileId);
    if (!(selection.type === 'preset' || selection.type === 'saved') || setupState.matchStarted) {
        return;
    }

    applyRules(selection.values);
    setRulesFormValues(selection.values);

    setupState.rulesConfirmed = true;
    setupState.rulesSource = selection.type;
    setupState.rulesProfileId = profileId;
    setupState.rulesProfileLabel = selection.label;
    setupState.teamDetailsConfirmed = false;
    setupState.prematchTossConfirmed = false;
    resetLineupsState();
    mygame.addExternalEvent('rules_applied', {
        source: selection.type,
        profileId,
        profileLabel: selection.label,
        values: { ...selection.values }
    });

    setRulesFeedback(`${selection.label} rules applied.`, 'success');
    setSetupFeedback('Rules profile applied. Next step: complete Team Details and rosters, then toss choices.', 'success');
    setTeamDetailsFeedback('Complete team names and both rosters before prematch toss choices.', '');
    if (!setupState.matchStarted) {
        setActivePanel('teamDetails');
    }
    updateSetsElements();
}

function applySelectedRulesProfile() {
    const selectedProfile = parseProfileSelection(elements.rulesProfile.value);
    if (selectedProfile.type === 'custom') {
        setRulesFeedback('Custom profile selected. Edit values and click Save Custom Rules.', '');
        return;
    }
    applyPresetProfile(elements.rulesProfile.value);
}

function saveCustomRules() {
    if (setupState.matchStarted || parseProfileSelection(elements.rulesProfile.value).type !== 'custom') {
        return;
    }

    try {
        const customRules = getRulesFromForm();
        applyRules(customRules);
        setupState.rulesConfirmed = true;
        setupState.rulesSource = 'custom';
        setupState.rulesProfileId = 'custom';
        setupState.rulesProfileLabel = 'Custom';
        setupState.teamDetailsConfirmed = false;
        setupState.prematchTossConfirmed = false;
        resetLineupsState();
        mygame.addExternalEvent('rules_applied', {
            source: 'custom',
            profileId: 'custom',
            profileLabel: 'Custom',
            values: { ...customRules }
        });

        setRulesFeedback('Custom rules saved and confirmed.', 'success');
        setSetupFeedback('Custom rules saved. Next step: complete Team Details and rosters, then toss choices.', 'success');
        setTeamDetailsFeedback('Complete team names and both rosters before prematch toss choices.', '');
        if (!setupState.matchStarted) {
            setActivePanel('teamDetails');
        }
        updateSetsElements();
    } catch (error) {
        setRulesFeedback(error.message, 'error');
    }
}

function saveCurrentRulesAsNewProfile() {
    if (setupState.matchStarted || parseProfileSelection(elements.rulesProfile.value).type !== 'custom') {
        return;
    }

    const profileName = elements.newRulesProfileName.value.trim();
    if (!profileName) {
        setRulesFeedback('Enter a profile name before saving.', 'error');
        return;
    }

    const duplicateName = savedRuleProfiles.some((profile) => profile.name.toLowerCase() === profileName.toLowerCase());
    if (duplicateName) {
        setRulesFeedback('A saved profile with that name already exists.', 'error');
        return;
    }

    try {
        const customRules = getRulesFromForm();
        const savedId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        savedRuleProfiles.push({
            id: savedId,
            name: profileName,
            values: customRules
        });
        persistSavedRuleProfiles();
        rebuildRulesProfileOptions(`saved:${savedId}`);
        updateRulesPanelView();
        elements.newRulesProfileName.value = '';
        setRulesFeedback(`Saved profile "${profileName}". Click Apply Profile to use it.`, 'success');
    } catch (error) {
        setRulesFeedback(error.message, 'error');
    }
}

function deleteSelectedSavedProfile() {
    if (setupState.matchStarted) {
        return;
    }

    const selected = parseProfileSelection(elements.rulesProfile.value);
    if (selected.type !== 'saved') {
        setRulesFeedback('Select a saved profile to delete.', 'error');
        return;
    }

    const profileToDelete = savedRuleProfiles.find((profile) => profile.id === selected.id);
    savedRuleProfiles = savedRuleProfiles.filter((profile) => profile.id !== selected.id);
    persistSavedRuleProfiles();

    rebuildRulesProfileOptions('custom');
    updateRulesPanelView();

    if (setupState.rulesProfileId === `saved:${selected.id}`) {
        setupState.rulesConfirmed = false;
        setupState.rulesSource = 'none';
        setupState.rulesProfileId = 'none';
        setupState.rulesProfileLabel = 'Not Set';
    }

    setRulesFeedback(`Deleted profile "${profileToDelete ? profileToDelete.name : selected.label}".`, 'success');
    updateSetsElements();
}

function handleRulesProfileChange() {
    if (setupState.matchStarted) {
        return;
    }

    const selectedProfileValue = elements.rulesProfile.value;
    const selectedProfile = parseProfileSelection(selectedProfileValue);
    updateRulesPanelView();

    if (selectedProfileValue === setupState.rulesProfileId && setupState.rulesConfirmed) {
        return;
    }

    setupState.rulesConfirmed = false;
    setupState.rulesSource = 'none';
    setupState.teamDetailsConfirmed = false;
    setupState.prematchTossConfirmed = false;
    resetLineupsState();

    if (selectedProfile.type === 'custom') {
        setupState.rulesProfileLabel = 'Custom';
        setRulesFeedback('Custom profile selected. Edit values and save to confirm.', '');
    } else {
        setupState.rulesProfileLabel = selectedProfile.type === 'unknown' ? 'Not Set' : selectedProfile.label;
        setRulesFeedback('Profile selected. Click Apply Profile to confirm rules.', '');
    }

    updateSetsElements();
}

function startCurrentSet() {
    if (mygame.isGameOver) {
        return;
    }

    const selections = validateBeforeSetStart();
    if (!selections) {
        updateSetsElements();
        return;
    }

    const startingSetNumber = mygame.getCurrentSet();
    const firstSetStart = !setupState.matchStarted;
    const startTimes = getOfficialAndActualStartTimesForSet(startingSetNumber);
    setupState.matchStarted = true;
    ensureLineupStateForCurrentSet();
    markCurrentSetStarted();
    mygame.recordSetStartTime(startingSetNumber, startTimes.startTime, startTimes.actualStartTime);
    setLineupsFeedback('', '');
    if (firstSetStart) {
        lockPrematchSetup();
        mygame.addExternalEvent('match_started', {
            setNumber: startingSetNumber,
            teamA: mygame.teamA,
            teamB: mygame.teamB,
            firstServer: mygame.team_serving_startset
        });
    }
    setActivePanel('scoreboard');
    mygame.addExternalEvent('set_started', {
        setNumber: startingSetNumber,
        firstSetStart,
        startTime: startTimes.startTime,
        actualStartTime: startTimes.actualStartTime,
        teamA: mygame.teamA,
        teamB: mygame.teamB
    });

    const delayNote = startTimes.startTime === startTimes.actualStartTime
        ? ''
        : ` Actual start recorded as ${startTimes.actualStartTime}.`;
    setSetupFeedback(`Set ${startingSetNumber} started at ${startTimes.startTime}. Lineups are now locked for this set.${delayNote}`, 'success');
    setLineupsFeedback(`Set ${startingSetNumber} started at ${startTimes.startTime}. Lineups are now locked for this set.${delayNote}`, 'success');
    updateSetsElements();
}

function applyDeciderToss() {
    const deciderTossRequired = setupState.matchStarted && !mygame.isGameOver && mygame.isPreDeciderToss;
    if (!deciderTossRequired) {
        return;
    }

    const leftTeam = elements.deciderLeftTeam.value;
    const servingTeam = elements.deciderServingTeam.value;

    if (!leftTeam || !servingTeam) {
        setSetupFeedback('Select both decider left-side team and first server.', 'error');
        return;
    }

    setupState.deciderLeftStarter = leftTeam;
    mygame.onLeft = leftTeam === 'teamA';
    mygame.team_serving_deciderset = servingTeam;
    mygame.addExternalEvent('decider_toss_applied', {
        setNumber: mygame.getCurrentSet(),
        leftTeam,
        servingTeam
    });

    setSetupFeedback('Decider toss applied.', 'success');
    setActivePanel('scoreboard');
    updateSetsElements();
}

function applyPrematchTossChoices() {
    if (setupState.matchStarted) {
        return;
    }

    const selections = validatePrematchSelections();
    if (!selections) {
        updateSetsElements();
        return;
    }

    mygame.teamA = selections.leftStarter;
    mygame.onLeft = true;
    mygame.team_serving_startset = selections.firstServer;
    mygame.addExternalEvent('prematch_toss_applied', {
        leftStarter: selections.leftStarter,
        firstServer: selections.firstServer,
        homeTeam: selections.homeName,
        awayTeam: selections.awayName
    });

    setupState.prematchTossConfirmed = true;
    resetLineupsState();
    ensureLineupStateForCurrentSet();
    setSetupFeedback('Prematch toss choices applied. You can now stage lineups and start Set 1.', 'success');
    setLineupsFeedback('Prematch toss complete. Please set lineups for Set 1.', '');
    setActivePanel('lineups');
    updateSetsElements();
}

function applyTeamDetails() {
    if (setupState.matchStarted) {
        return;
    }

    const teamDetails = validateTeamDetails();
    if (!teamDetails) {
        updateSetsElements();
        return;
    }

    mygame.fixture.hometeam_name = teamDetails.homeName;
    mygame.fixture.awayteam_name = teamDetails.awayName;
    mygame.fixture.home_roster = teamDetails.homeRoster;
    mygame.fixture.away_roster = teamDetails.awayRoster;
    setupState.teamDetailsConfirmed = true;
    setupState.prematchTossConfirmed = false;
    resetLineupsState();
    mygame.addExternalEvent('team_details_applied', {
        homeTeam: teamDetails.homeName,
        awayTeam: teamDetails.awayName,
        homeRosterCount: teamDetails.homeRoster.length,
        awayRosterCount: teamDetails.awayRoster.length
    });

    setTeamDetailsFeedback('Team details and rosters applied. Continue to prematch toss choices.', 'success');
    setSetupFeedback('Team details and rosters applied. Complete prematch toss choices next.', '');
    setActivePanel('setup');
    updateSetsElements();
}

function completeCurrentSet() {
    const completedSetNumber = mygame.getCurrentSet();
    const actualEndTime = getRoundedCurrentTimeString();
    const setTimeEntry = getSetTimeEntry(completedSetNumber);
    const minimumOfficialEndTime = setTimeEntry?.startTime
        ? addMinutesToTimeString(setTimeEntry.startTime, 1)
        : '';
    const endTime = getLaterTimeString(actualEndTime, minimumOfficialEndTime);
    mygame.recordSetEndTime(completedSetNumber, endTime, actualEndTime);
    mygame.completeSet();
    ensureLineupStateForCurrentSet();
    const endDelayNote = actualEndTime && endTime !== actualEndTime
        ? ` Actual end recorded as ${actualEndTime}.`
        : '';
    setLineupsFeedback(`Set ${completedSetNumber} completed at ${endTime}.${endDelayNote}`, 'success');
    setSetupFeedback(`Set ${completedSetNumber} completed at ${endTime}. Stage lineups for Set ${getCurrentSetNumberForLineup()} when ready.${endDelayNote}`, 'success');
    updateSetsElements();
}

function interruptGame() {
    const shouldInterrupt = window.confirm('Interrupt this game before match completion?');
    if (!shouldInterrupt) {
        return;
    }

    mygame.interruptReason = window.prompt('Please enter an interruption reason (optional):') || 'No reason provided';
    mygame.completeGame();
    updateSetsElements();
}

function hookEventListeners() {
    elements.toggleScoreboardPanel.addEventListener('click', () => setActivePanel('scoreboard'));
    elements.toggleLineupsPanel.addEventListener('click', () => setActivePanel('lineups'));
    elements.toggleTeamDetailsPanel.addEventListener('click', () => setActivePanel('teamDetails'));
    elements.toggleSetupPanel.addEventListener('click', () => setActivePanel('setup'));
    elements.toggleRulesPanel.addEventListener('click', () => setActivePanel('rules'));

    elements.rulesProfile.addEventListener('change', handleRulesProfileChange);
    elements.applyRulesProfile.addEventListener('click', applySelectedRulesProfile);
    elements.saveCustomRules.addEventListener('click', saveCustomRules);
    elements.saveRulesProfile.addEventListener('click', saveCurrentRulesAsNewProfile);
    elements.deleteRulesProfile.addEventListener('click', deleteSelectedSavedProfile);
    elements.exportRulesJson.addEventListener('click', exportRulesAsJson);
    elements.importRulesJson.addEventListener('click', importRulesFromJson);
    elements.importRulesJsonInput.addEventListener('change', handleImportRulesJsonFile);

    elements.addHomePlayer.addEventListener('click', () => addRosterPlayer('home'));
    elements.addAwayPlayer.addEventListener('click', () => addRosterPlayer('away'));
    elements.exportHomeRosterJson.addEventListener('click', () => exportSingleTeamRosterAsJson('home'));
    elements.importHomeRosterJson.addEventListener('click', () => importSingleTeamRosterFromJson('home'));
    elements.importHomeRosterJsonInput.addEventListener('change', (event) => {
        handleImportSingleTeamRosterJsonFile(event, 'home');
    });
    elements.exportAwayRosterJson.addEventListener('click', () => exportSingleTeamRosterAsJson('away'));
    elements.importAwayRosterJson.addEventListener('click', () => importSingleTeamRosterFromJson('away'));
    elements.importAwayRosterJsonInput.addEventListener('change', (event) => {
        handleImportSingleTeamRosterJsonFile(event, 'away');
    });
    const onRosterBodyClick = (event) => {
        const button = event.target.closest('.remove-player-btn, .edit-player-btn');
        if (!button) {
            return;
        }
        if (button.classList.contains('edit-player-btn')) {
            editRosterPlayer(button.dataset.team, button.dataset.playerId);
            return;
        }
        removeRosterPlayer(button.dataset.team, button.dataset.playerId);
    };
    for (const body of [
        elements.homeBenchRosterBody,
        elements.homeRegularRosterBody,
        elements.homeLiberoRosterBody,
        elements.awayBenchRosterBody,
        elements.awayRegularRosterBody,
        elements.awayLiberoRosterBody
    ]) {
        body.addEventListener('click', onRosterBodyClick);
    }

    elements.applyTeamDetails.addEventListener('click', applyTeamDetails);
    elements.applyPrematchToss.addEventListener('click', applyPrematchTossChoices);
    elements.applyLineups.addEventListener('click', applyLineupsForCurrentSet);
    elements.startMatch.addEventListener('click', startCurrentSet);
    elements.applyDeciderToss.addEventListener('click', applyDeciderToss);
    elements.quickSaveMatch.addEventListener('click', quickSaveMatchState);
    elements.quickLoadMatch.addEventListener('click', quickLoadMatchState);
    elements.exportMatchJson.addEventListener('click', exportMatchStateAsJson);
    elements.importMatchJson.addEventListener('click', importMatchStateFromJson);
    elements.importMatchJsonInput.addEventListener('change', handleImportMatchJsonFile);

    for (const select of getAllLineupSelectElements()) {
        select.addEventListener('change', () => {
            markLineupDirtyFromFormChange(select);
            renderLineupsPanel();
            updateSetupBadge();
            updateActionAvailability();
        });
    }

    elements.completeSet.addEventListener('click', completeCurrentSet);
    elements.completeGame.addEventListener('click', interruptGame);

    elements.incTeamA.addEventListener('click', () => {
        mygame.awardPoint('teamA');
        updateSetsElements();
    });

    elements.incTeamB.addEventListener('click', () => {
        mygame.awardPoint('teamB');
        updateSetsElements();
    });

    elements.undoLastPoint.addEventListener('click', () => {
        mygame.undoLastPoint();
        updateSetsElements();
    });

    elements.redoLastPoint.addEventListener('click', () => {
        mygame.redoLastPoint();
        updateSetsElements();
    });

    for (const input of [
        elements.regsetpts,
        elements.nbsetswin,
        elements.decidersetpts,
        elements.ptsdiffwinpts,
        elements.ptsdiffwinset,
        elements.swapsidesindecider,
        elements.nbptsforswap,
        elements.maxnumberplayers,
        elements.minliberoifthirteen,
        elements.breakBetweenSetsMins,
        elements.allowPlayerStaffRoleCumulation
    ]) {
        input.addEventListener('change', markRulesDirty);
    }

    for (const teamSide of ['home', 'away']) {
        const controls = getRosterInputs(teamSide);
        controls.isPlayerInput.addEventListener('change', () => {
            syncRosterEntryFormState(teamSide);
            updateActionAvailability();
        });
    }

    for (const input of [elements.homeTeamName, elements.awayTeamName]) {
        input.addEventListener('input', () => {
            if (!setupState.matchStarted) {
                markTeamDetailsDirty();
                setTeamDetailsFeedback('Names changed. Click Apply Team Details to confirm.', '');
            }
            updateSetupBadge();
            updateActionAvailability();
        });
    }

    for (const radio of document.querySelectorAll('input[name="setup-left-starter"], input[name="setup-first-server"]')) {
        radio.addEventListener('change', () => {
            if (!setupState.matchStarted) {
                setupState.prematchTossConfirmed = false;
            }
            updateSetupBadge();
            updateActionAvailability();
        });
    }

    elements.darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

function initSetupDefaults() {
    setActivePanel('rules');

    elements.homeTeamName.value = mygame.fixture.hometeam_name;
    elements.awayTeamName.value = mygame.fixture.awayteam_name;
    setupState.teamDetailsConfirmed = false;
    setupState.rosters.home = Array.isArray(mygame.fixture.home_roster)
        ? mygame.fixture.home_roster.map(normalizeExistingRosterEntry).filter(Boolean)
        : [];
    setupState.rosters.away = Array.isArray(mygame.fixture.away_roster)
        ? mygame.fixture.away_roster.map(normalizeExistingRosterEntry).filter(Boolean)
        : [];
    setupState.editingRosterPlayerId.home = '';
    setupState.editingRosterPlayerId.away = '';
    setupState.nextRosterPlayerId = 1;
    for (const player of [...setupState.rosters.home, ...setupState.rosters.away]) {
        if (typeof player.id === 'string' && player.id.startsWith('p_')) {
            const numericPart = Number.parseInt(player.id.slice(2), 10);
            if (Number.isInteger(numericPart) && numericPart >= setupState.nextRosterPlayerId) {
                setupState.nextRosterPlayerId = numericPart + 1;
            }
        }
    }

    if (setupState.rosters.home.length === 0) {
        setupState.rosters.home = createDefaultRoster();
    }
    if (setupState.rosters.away.length === 0) {
        setupState.rosters.away = createDefaultRoster();
    }
    resetLineupsState();

    const defaultLeftStarter = document.querySelector('input[name="setup-left-starter"][value="home"]');
    const defaultServer = document.querySelector('input[name="setup-first-server"][value="teamA"]');

    if (defaultLeftStarter) {
        defaultLeftStarter.checked = true;
    }
    if (defaultServer) {
        defaultServer.checked = true;
    }

    loadSavedRuleProfiles();
    rebuildRulesProfileOptions(DEFAULT_PROFILE_ID);
    setRulesFormValues(getCurrentRulesValuesFromFixture());
    updateRulesPanelView();
    updateRosterRuleHint();
    renderRosters();
    syncRosterEntryFormState('home');
    syncRosterEntryFormState('away');

    setSetupFeedback('After rules are confirmed, complete Team Details and rosters, then toss choices to prepare Set 1.', '');
    setTeamDetailsFeedback('Enter both team names, build both rosters, then click Apply Team Details.', '');
    setLineupsFeedback('Lineups are required at the start of each set after the match starts.', '');
    setRulesFeedback('Select or load a profile and click Apply Profile, or choose Custom and save.', '');
}

function init() {
    initDarkMode();
    initSetupDefaults();
    hookEventListeners();
    if (setupState.matchStarted) {
        setActivePanel('scoreboard');
    }
    updateSetsElements();
}

init();
