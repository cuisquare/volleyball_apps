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
            breakBetweenSetsMins: 3,
            maxTimeoutsRegularSet: 2,
            maxTimeoutsDeciderSet: 1,
            maxSubsPerSet: 6
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
            breakBetweenSetsMins: 3,
            maxTimeoutsRegularSet: 2,
            maxTimeoutsDeciderSet: 2,
            maxSubsPerSet: 6
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

function getBenchRoleSortRank(benchRole) {
    const index = BENCH_ROLES.indexOf(benchRole);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

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
    rosterEditor: {
        open: false,
        teamSide: 'home'
    },
    substitutionMode: {
        active: false,
        teamId: '',
        outgoingPosition: 0,
        requestPairs: []
    },
    substitutionInterruptionPairs: {
        teamA: [],
        teamB: []
    },
    substitutionPanelNotice: {
        message: '',
        items: []
    },
    courtRotationHistory: [],
    courtRotationRedoHistory: [],
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
    lineupsSubstitutionStatus: document.getElementById('lineups-substitution-status'),
    lineupsSubstitutionUnavailable: document.getElementById('lineups-substitution-unavailable'),
    lineupsSetLabel: document.getElementById('lineups-set-label'),
    lineupsTeamACard: document.getElementById('lineups-teamA-card'),
    lineupsTeamBCard: document.getElementById('lineups-teamB-card'),
    lineupsTeamATitle: document.getElementById('lineups-teamA-title'),
    lineupsTeamBTitle: document.getElementById('lineups-teamB-title'),
    applyLineups: document.getElementById('apply-lineups'),
    doneSubstitutions: document.getElementById('done-substitutions'),
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
    addHomePlayer: document.getElementById('add-home-player'),
    homeRosterCount: document.getElementById('home-roster-count'),
    homeBenchRosterBody: document.getElementById('home-bench-roster-body'),
    homeRegularRosterBody: document.getElementById('home-regular-roster-body'),
    homeLiberoRosterBody: document.getElementById('home-libero-roster-body'),
    homeUnrosteredRosterBody: document.getElementById('home-unrostered-roster-body'),
    addAwayPlayer: document.getElementById('add-away-player'),
    awayRosterCount: document.getElementById('away-roster-count'),
    awayBenchRosterBody: document.getElementById('away-bench-roster-body'),
    awayRegularRosterBody: document.getElementById('away-regular-roster-body'),
    awayLiberoRosterBody: document.getElementById('away-libero-roster-body'),
    awayUnrosteredRosterBody: document.getElementById('away-unrostered-roster-body'),
    rosterEntryModal: document.getElementById('roster-entry-modal'),
    rosterEntryModalTitle: document.getElementById('roster-entry-modal-title'),
    rosterEntryModalSubtitle: document.getElementById('roster-entry-modal-subtitle'),
    closeRosterEntryModal: document.getElementById('close-roster-entry-modal'),
    rosterEntryFirstName: document.getElementById('roster-entry-first-name'),
    rosterEntryLastName: document.getElementById('roster-entry-last-name'),
    rosterEntryIsPlayer: document.getElementById('roster-entry-is-player'),
    rosterEntryRostered: document.getElementById('roster-entry-rostered'),
    rosterEntryNumber: document.getElementById('roster-entry-number'),
    rosterEntryRegNumber: document.getElementById('roster-entry-reg-number'),
    rosterEntryBenchRole: document.getElementById('roster-entry-bench-role'),
    rosterEntryLibero: document.getElementById('roster-entry-libero'),
    rosterEntryCaptain: document.getElementById('roster-entry-captain'),
    saveRosterEntry: document.getElementById('save-roster-entry'),
    cancelRosterEntry: document.getElementById('cancel-roster-entry'),
    removeRosterEntry: document.getElementById('remove-roster-entry'),
    rosterEntryFeedback: document.getElementById('roster-entry-feedback'),
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
    scoreboardTeamATitle: document.getElementById('scoreboard-teamA-title'),
    scoreboardTeamBTitle: document.getElementById('scoreboard-teamB-title'),
    scoreboardCourtTeamA: document.getElementById('scoreboard-court-teamA'),
    scoreboardCourtTeamB: document.getElementById('scoreboard-court-teamB'),
    gameStatusTeamALabel: document.getElementById('game-status-teamA-label'),
    gameStatusTeamBLabel: document.getElementById('game-status-teamB-label'),
    scoreTeamA: document.getElementById('score-teamA'),
    scoreTeamB: document.getElementById('score-teamB'),
    setsTeamA: document.getElementById('sets-teamA'),
    setsTeamB: document.getElementById('sets-teamB'),
    pointsTeamA: document.getElementById('points-teamA'),
    pointsTeamB: document.getElementById('points-teamB'),
    servingStateTeamA: document.getElementById('servingstate-teamA'),
    servingStateTeamB: document.getElementById('servingstate-teamB'),
    timeoutsLeftTeamA: document.getElementById('timeouts-left-teamA'),
    timeoutsLeftTeamB: document.getElementById('timeouts-left-teamB'),
    gameStatus: document.getElementById('game-status'),
    teamsContainer: document.getElementById('teams-container'),
    incTeamA: document.getElementById('increase-score-teamA'),
    incTeamB: document.getElementById('increase-score-teamB'),
    timeoutTeamA: document.getElementById('timeout-teamA'),
    timeoutTeamB: document.getElementById('timeout-teamB'),
    subTeamA: document.getElementById('sub-teamA'),
    subTeamB: document.getElementById('sub-teamB'),
    subsUsedTeamA: document.getElementById('subs-used-teamA'),
    subsUsedTeamB: document.getElementById('subs-used-teamB'),
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
    maxTimeoutsRegularSet: document.getElementById('maxtimeoutsregularset'),
    maxTimeoutsDeciderSet: document.getElementById('maxtimeoutsdeciderset'),
    maxSubsPerSet: document.getElementById('maxsubsset'),
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
    if (setupState.rosterEditor.open) {
        elements.rosterEntryFeedback.textContent = message;
        elements.rosterEntryFeedback.classList.remove('hidden', 'error', 'success');
        if (variant) {
            elements.rosterEntryFeedback.classList.add(variant);
        }
    } else {
        elements.rosterEntryFeedback.textContent = '';
        elements.rosterEntryFeedback.classList.add('hidden');
        elements.rosterEntryFeedback.classList.remove('error', 'success');
    }
}

function setLineupsSubstitutionHint(message = '', unavailableItems = []) {
    elements.lineupsSubstitutionStatus.textContent = message;
    elements.lineupsSubstitutionUnavailable.innerHTML = '';
    if (!Array.isArray(unavailableItems) || unavailableItems.length === 0) {
        elements.lineupsSubstitutionUnavailable.classList.add('hidden');
        return;
    }
    for (const item of unavailableItems) {
        const li = document.createElement('li');
        li.textContent = item;
        elements.lineupsSubstitutionUnavailable.appendChild(li);
    }
    elements.lineupsSubstitutionUnavailable.classList.remove('hidden');
}

function setSubstitutionPanelNotice(message = '', items = []) {
    setupState.substitutionPanelNotice = {
        message,
        items: Array.isArray(items) ? [...items] : []
    };
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
        maxTimeoutsRegularSet: mygame.fixture.rules.maxTimeoutsRegularSet,
        maxTimeoutsDeciderSet: mygame.fixture.rules.maxTimeoutsDeciderSet,
        maxSubsPerSet: mygame.fixture.rules.maxSubsPerSet,
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
    updateRosterEntryModalUi();
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
        elements.rosterEntryFirstName,
        elements.rosterEntryLastName,
        elements.rosterEntryIsPlayer,
        elements.rosterEntryRostered,
        elements.rosterEntryNumber,
        elements.rosterEntryRegNumber,
        elements.rosterEntryBenchRole,
        elements.rosterEntryLibero,
        elements.rosterEntryCaptain,
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
    const legacySplit = splitLegacyRosterName(name);
    const firstName = typeof rawPlayer.firstName === 'string' && rawPlayer.firstName.trim()
        ? rawPlayer.firstName.trim()
        : legacySplit.firstName;
    const lastName = typeof rawPlayer.lastName === 'string' && rawPlayer.lastName.trim()
        ? rawPlayer.lastName.trim()
        : legacySplit.lastName;
    const resolvedName = buildFullRosterName(firstName, lastName) || name;
    if (!resolvedName) {
        throw new Error(`${teamLabel} roster entry ${index + 1} is missing a player name.`);
    }

    const isPlayer = rawPlayer.isPlayer !== undefined ? Boolean(rawPlayer.isPlayer) : true;
    const shirtNumber = Number.parseInt(rawPlayer.shirtNumber, 10);
    const regNumber = rawPlayer.regNumber == null ? '' : String(rawPlayer.regNumber).trim();
    const benchRole = normalizeBenchRole(rawPlayer.benchRole);
    const rostered = rawPlayer.rostered !== undefined ? Boolean(rawPlayer.rostered) : true;
    const isLibero = isPlayer && Boolean(rawPlayer.isLibero);
    const isCaptain = isPlayer && Boolean(rawPlayer.isCaptain);

    if (isPlayer && (!Number.isInteger(shirtNumber) || shirtNumber <= 0)) {
        throw new Error(`${teamLabel} roster entry ${index + 1} has invalid shirt number.`);
    }

    return {
        id: '',
        firstName,
        lastName,
        name: resolvedName,
        shirtNumber: isPlayer ? shirtNumber : null,
        regNumber,
        isPlayer,
        rostered,
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
    const rosterEntryError = validateRosterEntryForTeam(expectedTeamSide, roster, { allowExtraLiberos: true });
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
        closeRosterEntryModal();
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

function getMinLiberosForActiveRoster(playerCount) {
    if (playerCount >= 14) {
        return 2;
    }
    if (playerCount === 13) {
        return getMinLiberosIfThirteen();
    }
    return 0;
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
    elements.rosterRulesHint.textContent = `Active match roster limits: up to ${maxPlayers} rostered players per team, max 12 rostered non-libero players, and max ${maxLiberos} rostered liberos. If the active roster has exactly 13 players, at least ${minLiberos} libero(s) are required; at 14 players, 2 liberos are required. Additional eligible but non-rostered entries are allowed. ${cumulationHint}`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildFullRosterName(firstName, lastName) {
    return [firstName, lastName].filter(Boolean).join(' ').trim();
}

function splitLegacyRosterName(fullName) {
    const normalized = typeof fullName === 'string' ? fullName.trim().replace(/\s+/g, ' ') : '';
    if (!normalized) {
        return { firstName: '', lastName: '' };
    }
    const parts = normalized.split(' ');
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
    }
    return {
        firstName: parts.slice(0, -1).join(' '),
        lastName: parts[parts.length - 1]
    };
}

function formatRosterListName(player) {
    if (player.firstName && player.lastName) {
        const initials = player.firstName
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => `${part.charAt(0).toUpperCase()}.`)
            .join(' ');
        return `${player.lastName}, ${initials}`.trim();
    }
    return player.name || buildFullRosterName(player.firstName, player.lastName) || '';
}

function getRosterHoverName(player) {
    return buildFullRosterName(player.firstName, player.lastName) || player.name || '';
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
    const legacyName = typeof rawPlayer.name === 'string' ? rawPlayer.name.trim() : '';
    const legacySplit = splitLegacyRosterName(legacyName);
    const firstName = typeof rawPlayer.firstName === 'string' && rawPlayer.firstName.trim()
        ? rawPlayer.firstName.trim()
        : legacySplit.firstName;
    const lastName = typeof rawPlayer.lastName === 'string' && rawPlayer.lastName.trim()
        ? rawPlayer.lastName.trim()
        : legacySplit.lastName;
    const resolvedName = buildFullRosterName(firstName, lastName) || legacyName;

    return {
        id: typeof rawPlayer.id === 'string' ? rawPlayer.id : '',
        firstName,
        lastName,
        name: resolvedName,
        shirtNumber: isPlayer && Number.isInteger(shirtNumber) && shirtNumber > 0 ? shirtNumber : null,
        regNumber: rawPlayer.regNumber == null ? '' : String(rawPlayer.regNumber).trim(),
        isPlayer,
        rostered: rawPlayer.rostered !== undefined ? Boolean(rawPlayer.rostered) : true,
        isLibero: isPlayer && Boolean(rawPlayer.isLibero),
        isCaptain: isPlayer && Boolean(rawPlayer.isCaptain),
        benchRole: normalizeBenchRole(rawPlayer.benchRole)
    };
}

function getRosterInputs(teamSide) {
    if (teamSide === 'home') {
        return {
            firstNameInput: elements.rosterEntryFirstName,
            lastNameInput: elements.rosterEntryLastName,
            isPlayerInput: elements.rosterEntryIsPlayer,
            rosteredInput: elements.rosterEntryRostered,
            numberInput: elements.rosterEntryNumber,
            regInput: elements.rosterEntryRegNumber,
            benchRoleInput: elements.rosterEntryBenchRole,
            liberoInput: elements.rosterEntryLibero,
            captainInput: elements.rosterEntryCaptain,
            addButton: elements.addHomePlayer,
            regularBody: elements.homeRegularRosterBody,
            benchBody: elements.homeBenchRosterBody,
            liberoBody: elements.homeLiberoRosterBody,
            unrosteredBody: elements.homeUnrosteredRosterBody,
            count: elements.homeRosterCount
        };
    }

    return {
        firstNameInput: elements.rosterEntryFirstName,
        lastNameInput: elements.rosterEntryLastName,
        isPlayerInput: elements.rosterEntryIsPlayer,
        rosteredInput: elements.rosterEntryRostered,
        numberInput: elements.rosterEntryNumber,
        regInput: elements.rosterEntryRegNumber,
        benchRoleInput: elements.rosterEntryBenchRole,
        liberoInput: elements.rosterEntryLibero,
        captainInput: elements.rosterEntryCaptain,
        addButton: elements.addAwayPlayer,
        regularBody: elements.awayRegularRosterBody,
        benchBody: elements.awayBenchRosterBody,
        liberoBody: elements.awayLiberoRosterBody,
        unrosteredBody: elements.awayUnrosteredRosterBody,
        count: elements.awayRosterCount
    };
}

function syncRosterEntryFormState(teamSide) {
    const controls = getRosterInputs(teamSide);
    const isPlayer = controls.isPlayerInput.checked;
    const isRostered = controls.rosteredInput.checked;
    controls.rosteredInput.disabled = setupState.matchStarted;
    controls.numberInput.disabled = !isPlayer || setupState.matchStarted;
    controls.liberoInput.disabled = !isPlayer || setupState.matchStarted;
    controls.captainInput.disabled = !isPlayer || !isRostered || setupState.matchStarted;

    if (!isPlayer) {
        controls.liberoInput.checked = false;
        controls.captainInput.checked = false;
    }
    if (!isRostered) {
        controls.captainInput.checked = false;
    }
}

function resetRosterEntryEditorFields() {
    elements.rosterEntryFirstName.value = '';
    elements.rosterEntryLastName.value = '';
    elements.rosterEntryIsPlayer.checked = true;
    elements.rosterEntryRostered.checked = true;
    elements.rosterEntryNumber.value = '';
    elements.rosterEntryRegNumber.value = '';
    elements.rosterEntryBenchRole.value = '';
    elements.rosterEntryLibero.checked = false;
    elements.rosterEntryCaptain.checked = false;
    elements.rosterEntryFeedback.textContent = '';
    elements.rosterEntryFeedback.classList.add('hidden');
    elements.rosterEntryFeedback.classList.remove('error', 'success');
}

function updateRosterEntryModalUi() {
    const teamSide = setupState.rosterEditor.teamSide;
    const isEditing = Boolean(setupState.editingRosterPlayerId[teamSide]);
    elements.rosterEntryModalTitle.textContent = `${isEditing ? 'Edit' : 'Add'} ${getTeamSideLabel(teamSide)} Entry`;
    elements.rosterEntryModalSubtitle.textContent = isEditing
        ? `Update this ${teamSide} roster entry, then save or remove it.`
        : `Add one ${teamSide} roster entry and save it when ready.`;
    elements.saveRosterEntry.textContent = isEditing ? 'Save Entry' : 'Add Entry';
    elements.removeRosterEntry.classList.toggle('hidden', !isEditing);
    elements.removeRosterEntry.disabled = !isEditing || setupState.matchStarted;
    elements.saveRosterEntry.disabled = setupState.matchStarted || !setupState.rulesConfirmed;
    syncRosterEntryFormState(teamSide);
}

function openRosterEntryModal(teamSide, playerId = '') {
    if (setupState.matchStarted || !setupState.rulesConfirmed) {
        return;
    }

    let player = null;
    if (playerId) {
        player = setupState.rosters[teamSide].find((item) => item.id === playerId);
        if (!player) {
            return;
        }
    }

    setupState.editingRosterPlayerId.home = '';
    setupState.editingRosterPlayerId.away = '';
    setupState.rosterEditor.open = true;
    setupState.rosterEditor.teamSide = teamSide;
    resetRosterEntryEditorFields();

    if (player) {
        setupState.editingRosterPlayerId[teamSide] = playerId;
        elements.rosterEntryFirstName.value = player.firstName || '';
        elements.rosterEntryLastName.value = player.lastName || '';
        elements.rosterEntryIsPlayer.checked = Boolean(player.isPlayer);
        elements.rosterEntryRostered.checked = player.rostered !== undefined ? Boolean(player.rostered) : true;
        elements.rosterEntryNumber.value = player.shirtNumber || '';
        elements.rosterEntryRegNumber.value = player.regNumber || '';
        elements.rosterEntryBenchRole.value = player.benchRole || '';
        elements.rosterEntryLibero.checked = Boolean(player.isLibero);
        elements.rosterEntryCaptain.checked = Boolean(player.isCaptain);
        setTeamDetailsFeedback(`${getTeamSideLabel(teamSide)} entry loaded for edit.`, '');
    } else {
        setTeamDetailsFeedback(`Add a new ${getTeamSideLabel(teamSide).toLowerCase()} roster entry and save it when ready.`, '');
    }

    updateRosterEntryModalUi();
    elements.rosterEntryModal.classList.remove('hidden');
    elements.rosterEntryModal.setAttribute('aria-hidden', 'false');
    elements.rosterEntryFirstName.focus();
    renderRosters();
    updateActionAvailability();
}

function closeRosterEntryModal() {
    setupState.rosterEditor.open = false;
    setupState.editingRosterPlayerId.home = '';
    setupState.editingRosterPlayerId.away = '';
    resetRosterEntryEditorFields();
    elements.rosterEntryModal.classList.add('hidden');
    elements.rosterEntryModal.setAttribute('aria-hidden', 'true');
    renderRosters();
    updateActionAvailability();
}

function getRosteredPlayers(roster) {
    return roster.filter((player) => player.isPlayer && player.rostered);
}

function getDuplicateRosteredShirtNumbers(roster) {
    const counts = new Map();
    for (const player of getRosteredPlayers(roster)) {
        counts.set(player.shirtNumber, (counts.get(player.shirtNumber) || 0) + 1);
    }

    return Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([shirtNumber]) => shirtNumber)
        .sort((a, b) => a - b);
}

function renderRoster(teamSide) {
    const roster = setupState.rosters[teamSide];
    const controls = getRosterInputs(teamSide);
    controls.benchBody.innerHTML = '';
    controls.regularBody.innerHTML = '';
    controls.liberoBody.innerHTML = '';
    controls.unrosteredBody.innerHTML = '';

    const maxPlayers = getMaxRosterPlayers();
    const rosteredEntries = roster.filter((player) => player.rostered);
    const rosteredPlayers = getRosteredPlayers(roster);
    const rosteredBenchPersonnel = rosteredEntries.filter((player) => player.benchRole);
    const unrosteredEntries = roster.filter((player) => !player.rostered);
    const nonLiberos = rosteredPlayers.filter((player) => !player.isLibero).length;
    const liberos = rosteredPlayers.filter((player) => player.isLibero).length;
    const captains = rosteredPlayers.filter((player) => player.isCaptain).length;
    const missingPlayers = Math.max(0, 6 - rosteredPlayers.length);
    const missingNonLiberos = Math.max(0, 6 - nonLiberos);
    const overflowPlayers = Math.max(0, rosteredPlayers.length - maxPlayers);
    const overflowNonLiberos = Math.max(0, nonLiberos - 12);
    let readinessHint = 'Ready';
    const requiredLiberos = getMinLiberosForActiveRoster(rosteredPlayers.length);
    const missingLiberos = Math.max(0, requiredLiberos - liberos);
    const missingCaptain = captains === 0 ? 1 : 0;
    const duplicateShirtNumbers = getDuplicateRosteredShirtNumbers(roster);
    if (missingPlayers > 0 || missingNonLiberos > 0 || overflowPlayers > 0 || overflowNonLiberos > 0 || missingLiberos > 0 || missingCaptain > 0 || duplicateShirtNumbers.length > 0) {
        const parts = [];
        if (missingPlayers > 0) {
            parts.push(`${missingPlayers} more player(s)`);
        }
        if (missingNonLiberos > 0) {
            parts.push(`${missingNonLiberos} more non-libero player(s)`);
        }
        if (overflowPlayers > 0) {
            parts.push(`${overflowPlayers} fewer rostered player(s)`);
        }
        if (overflowNonLiberos > 0) {
            parts.push(`${overflowNonLiberos} fewer non-libero player(s)`);
        }
        if (missingLiberos > 0) {
            parts.push(`${missingLiberos} more libero(s)`);
        }
        if (missingCaptain > 0) {
            parts.push('1 more captain');
        }
        if (duplicateShirtNumbers.length > 0) {
            parts.push(`unique shirt numbers (duplicate: ${duplicateShirtNumbers.join(', ')})`);
        }
        readinessHint = `Not ready: need ${parts.join(', ')}`;
    }
    controls.count.textContent = `${roster.length} entries (${rosteredPlayers.length} / ${maxPlayers} rostered players, Active bench ${rosteredBenchPersonnel.length}, Unrostered ${unrosteredEntries.length}, Libero ${liberos}/${getMaxLiberosPerRoster()}, Captain ${captains}) - ${readinessHint}`;

    const byShirtNumber = (playerA, playerB) => {
        const shirtNumberA = playerA.shirtNumber || 0;
        const shirtNumberB = playerB.shirtNumber || 0;
        if (shirtNumberA !== shirtNumberB) {
            return shirtNumberA - shirtNumberB;
        }
        return formatRosterListName(playerA).localeCompare(formatRosterListName(playerB));
    };

    const regularPlayers = rosteredPlayers.filter((player) => !player.isLibero).sort(byShirtNumber);
    const liberoPlayers = rosteredPlayers.filter((player) => player.isLibero).sort(byShirtNumber);
    const benchPlayers = rosteredBenchPersonnel.sort((playerA, playerB) => {
        const roleRankDifference = getBenchRoleSortRank(playerA.benchRole) - getBenchRoleSortRank(playerB.benchRole);
        if (roleRankDifference !== 0) {
            return roleRankDifference;
        }
        return formatRosterListName(playerA).localeCompare(formatRosterListName(playerB));
    });
    const unrosteredPlayers = unrosteredEntries.sort((playerA, playerB) => {
        if (playerA.isPlayer !== playerB.isPlayer) {
            return playerA.isPlayer ? -1 : 1;
        }
        const roleRankDifference = getBenchRoleSortRank(playerA.benchRole || '') - getBenchRoleSortRank(playerB.benchRole || '');
        if (roleRankDifference !== 0) {
            return roleRankDifference;
        }
        const shirtNumberA = playerA.shirtNumber || 0;
        const shirtNumberB = playerB.shirtNumber || 0;
        if (shirtNumberA !== shirtNumberB) {
            return shirtNumberA - shirtNumberB;
        }
        return formatRosterListName(playerA).localeCompare(formatRosterListName(playerB));
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
            const displayName = formatRosterListName(player);
            const fullName = getRosterHoverName(player);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td title="${escapeHtml(fullName)}">${escapeHtml(displayName)}</td>
                <td>${player.shirtNumber}</td>
                <td>${player.regNumber ? escapeHtml(player.regNumber) : '-'}</td>
                <td>${player.isCaptain ? 'Yes' : '-'}</td>
                <td>
                    <button class="table-action-btn edit-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Edit</button>
                    <button class="table-action-btn unroster-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Unroster</button>
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
            const displayName = formatRosterListName(player);
            const fullName = getRosterHoverName(player);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td title="${escapeHtml(fullName)}">${escapeHtml(displayName)}</td>
                <td>${escapeHtml(player.benchRole)}</td>
                <td>${player.isPlayer ? 'Yes' : '-'}</td>
                <td>${player.isPlayer && player.shirtNumber ? player.shirtNumber : '-'}</td>
                <td>${player.regNumber ? escapeHtml(player.regNumber) : '-'}</td>
                <td>
                    <button class="table-action-btn edit-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Edit</button>
                    <button class="table-action-btn unroster-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Unroster</button>
                </td>
            `;
            targetBody.appendChild(row);
        }
    };

    const renderUnrosteredRows = (targetBody, players, emptyText) => {
        if (players.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td class="roster-empty" colspan="6">${emptyText}</td>`;
            targetBody.appendChild(emptyRow);
            return;
        }

        for (const player of players) {
            const canRemove = !setupState.matchStarted;
            const row = document.createElement('tr');
            const typeLabel = player.isPlayer ? (player.isLibero ? 'Libero' : 'Player') : 'Bench';
            const roleLabel = player.benchRole || (player.isCaptain ? 'Captain' : '-');
            const displayName = formatRosterListName(player);
            const fullName = getRosterHoverName(player);
            row.innerHTML = `
                <td title="${escapeHtml(fullName)}">${escapeHtml(displayName)}</td>
                <td>${typeLabel}</td>
                <td>${escapeHtml(roleLabel)}</td>
                <td>${player.shirtNumber || '-'}</td>
                <td>${player.regNumber ? escapeHtml(player.regNumber) : '-'}</td>
                <td>
                    <button class="table-action-btn edit-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Edit</button>
                    <button class="table-action-btn roster-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Roster</button>
                </td>
            `;
            targetBody.appendChild(row);
        }
    };

    renderBenchRows(controls.benchBody, benchPlayers, 'No bench personnel yet.');
    renderRows(controls.regularBody, regularPlayers, 'No regular players yet.');
    renderRows(controls.liberoBody, liberoPlayers, 'No libero players yet.');
    renderUnrosteredRows(controls.unrosteredBody, unrosteredPlayers, 'No eligible/unrostered entries yet.');

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
            firstName: `Player`,
            lastName: `${i}`,
            name: `Player ${i}`,
            shirtNumber: i,
            regNumber: '',
            isPlayer: true,
            rostered: true,
            isLibero: false,
            isCaptain: i === 1,
            benchRole: ''
        });
    }
    return roster;
}

function validateRosterForTeam(teamSide, roster) {
    const players = getRosteredPlayers(roster);
    if (players.length < 6) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least 6 players.`);
    }

    const maxPlayers = getMaxRosterPlayers();
    if (players.length > maxPlayers) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot exceed ${maxPlayers} players.`);
    }

    const duplicateShirtNumbers = getDuplicateRosteredShirtNumbers(roster);
    if (duplicateShirtNumbers.length > 0) {
        return withRulesContext(
            `${teamSide === 'home' ? 'Home' : 'Away'} roster has duplicate shirt number${duplicateShirtNumbers.length > 1 ? 's' : ''} ${duplicateShirtNumbers.join(', ')}.`
        );
    }

    const liberos = players.filter((player) => player.isLibero).length;
    const maxLiberos = getMaxLiberosPerRoster();
    if (liberos > maxLiberos) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot have more than ${maxLiberos} liberos.`);
    }
    const nonLiberos = players.length - liberos;
    if (nonLiberos > 12) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot have more than 12 non-libero players.`);
    }

    const captains = players.filter((player) => player.isCaptain).length;
    if (captains < 1) {
        return `${teamSide === 'home' ? 'Home' : 'Away'} roster must include exactly 1 captain.`;
    }
    if (captains > 1) {
        return `${teamSide === 'home' ? 'Home' : 'Away'} roster must include exactly 1 captain.`;
    }

    if (nonLiberos < 6) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least 6 non-libero players.`);
    }

    const minLiberos = getMinLiberosForActiveRoster(players.length);
    if (liberos < minLiberos) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least ${minLiberos} libero(s) when ${players.length} players are rostered.`);
    }

    return '';
}

function validateRosterEntryForTeam(teamSide, roster, options = {}) {
    const teamLabel = teamSide === 'home' ? 'Home' : 'Away';
    const allowExtraLiberos = Boolean(options.allowExtraLiberos);
    const players = getRosteredPlayers(roster);

    const liberos = players.filter((player) => player.isLibero).length;
    const maxLiberos = getMaxLiberosPerRoster();
    if (!allowExtraLiberos && liberos > maxLiberos) {
        return withRulesContext(`${teamLabel} roster cannot have more than ${maxLiberos} liberos.`);
    }

    const captains = players.filter((player) => player.isCaptain).length;
    if (captains > 1) {
        return `${teamLabel} roster cannot have more than 1 captain.`;
    }

    const usedBenchRoles = new Set();
    for (const player of roster) {
        if (!player.firstName || !player.lastName) {
            if (!player.name) {
                return `${teamLabel} roster entry first name and last name are required.`;
            }
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
        if (!player.rostered && player.isCaptain) {
            return `${teamLabel} captain must be part of the active game roster.`;
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
    setupState.editingRosterPlayerId[teamSide] = '';
    closeRosterEntryModal();
}

function toggleRosteredStatus(teamSide, playerId, nextRostered) {
    if (setupState.matchStarted) {
        return;
    }

    const roster = setupState.rosters[teamSide];
    const target = roster.find((player) => player.id === playerId);
    if (!target) {
        return;
    }

    const currentRosteredPlayers = getRosteredPlayers(roster).length;
    const currentRosteredLiberos = getRosteredPlayers(roster).filter((player) => player.isLibero).length;
    if (nextRostered && target.isPlayer && !target.rostered && currentRosteredPlayers >= getMaxRosterPlayers()) {
        setTeamDetailsFeedback(withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster is at max size for current rules. Unroster or remove an existing rostered player before rostering another player.`), 'error');
        return;
    }

    const nextRoster = roster.map((player) => {
        if (player.id !== playerId) {
            return player;
        }
        return {
            ...player,
            rostered: nextRostered,
            isCaptain: nextRostered ? player.isCaptain : false
        };
    });

    const nextRosteredLiberos = getRosteredPlayers(nextRoster).filter((player) => player.isLibero).length;
    if (nextRosteredLiberos > currentRosteredLiberos && nextRosteredLiberos > getMaxLiberosPerRoster()) {
        setTeamDetailsFeedback(
            withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot have more than ${getMaxLiberosPerRoster()} liberos.`),
            'error'
        );
        return;
    }

    const entryValidationError = validateRosterEntryForTeam(teamSide, nextRoster, { allowExtraLiberos: true });
    if (entryValidationError) {
        setTeamDetailsFeedback(entryValidationError, 'error');
        return;
    }

    setupState.rosters[teamSide] = nextRoster;
    if (setupState.rosterEditor.open && setupState.rosterEditor.teamSide === teamSide && setupState.editingRosterPlayerId[teamSide] === playerId) {
        const updated = nextRoster.find((player) => player.id === playerId);
        const controls = getRosterInputs(teamSide);
        controls.rosteredInput.checked = updated ? Boolean(updated.rostered) : false;
        controls.captainInput.checked = updated ? Boolean(updated.isCaptain) : false;
        updateRosterEntryModalUi();
    }
    markTeamDetailsDirty();
    renderRosters();
    setTeamDetailsFeedback(`${teamSide === 'home' ? 'Home' : 'Away'} entry ${nextRostered ? 'rostered' : 'unrostered'}. Click Apply Team Details when ready.`, '');
    updateSetupBadge();
    updateActionAvailability();
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
    const playerCount = getRosteredPlayers(roster).length;
    const currentRosteredLiberos = getRosteredPlayers(roster).filter((player) => player.isLibero).length;
    const maxPlayers = getMaxRosterPlayers();

    if (!editingId && controls.isPlayerInput.checked && controls.rosteredInput.checked && playerCount >= getMaxRosterPlayers()) {
        setTeamDetailsFeedback(withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster is at max size for current rules. Unroster or remove an existing rostered player before adding another rostered player.`), 'error');
        return;
    }

    const firstName = controls.firstNameInput.value.trim();
    const lastName = controls.lastNameInput.value.trim();
    const name = buildFullRosterName(firstName, lastName);
    const isPlayer = controls.isPlayerInput.checked;
    const rostered = controls.rosteredInput.checked;
    const shirtNumber = Number.parseInt(controls.numberInput.value, 10);
    const regNumber = controls.regInput.value.trim();
    const benchRole = normalizeBenchRole(controls.benchRoleInput.value);
    const isLibero = isPlayer && controls.liberoInput.checked;
    const isCaptain = isPlayer && controls.captainInput.checked;

    if (!firstName || !lastName) {
        setTeamDetailsFeedback('First name and last name are required.', 'error');
        return;
    }
    if (isPlayer && (!Number.isInteger(shirtNumber) || shirtNumber <= 0)) {
        setTeamDetailsFeedback('Shirt number must be a positive integer.', 'error');
        return;
    }

    const rosterForValidation = editingId
        ? roster.map((player) => (player.id === editingId
            ? {
                ...player,
                firstName,
                lastName,
                name,
                shirtNumber: isPlayer ? shirtNumber : null,
                regNumber,
                isPlayer,
                rostered,
                isLibero,
                isCaptain,
                benchRole
            }
            : player))
        : [...roster, {
            id: `p_${setupState.nextRosterPlayerId}`,
            firstName,
            lastName,
            name,
            shirtNumber: isPlayer ? shirtNumber : null,
            regNumber,
            isPlayer,
            rostered,
            isLibero,
            isCaptain,
            benchRole
        }];

    const nextRosteredPlayerCount = getRosteredPlayers(rosterForValidation).length;
    const nextRosteredLiberos = getRosteredPlayers(rosterForValidation).filter((player) => player.isLibero).length;
    const isIncreasingRosteredPlayers = nextRosteredPlayerCount > playerCount;
    if (isIncreasingRosteredPlayers && nextRosteredPlayerCount > maxPlayers) {
        setTeamDetailsFeedback(withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster is already above the active roster limit. Unroster or remove rostered players before increasing the rostered player count.`), 'error');
        return;
    }
    if (nextRosteredLiberos > currentRosteredLiberos && nextRosteredLiberos > getMaxLiberosPerRoster()) {
        setTeamDetailsFeedback(
            withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot have more than ${getMaxLiberosPerRoster()} liberos.`),
            'error'
        );
        return;
    }

    if (isCaptain) {
        for (const player of rosterForValidation) {
            if (editingId && player.id === editingId) {
                continue;
            }
            player.isCaptain = false;
        }
    }

    const entryValidationError = validateRosterEntryForTeam(teamSide, rosterForValidation, { allowExtraLiberos: true });
    if (entryValidationError) {
        setTeamDetailsFeedback(entryValidationError, 'error');
        return;
    }

    if (editingId) {
        setupState.rosters[teamSide] = rosterForValidation;
    } else {
        roster.push({
            id: `p_${setupState.nextRosterPlayerId++}`,
            firstName,
            lastName,
            name,
            shirtNumber: isPlayer ? shirtNumber : null,
            regNumber,
            isPlayer,
            rostered,
            isLibero,
            isCaptain,
            benchRole
        });
    }

    markTeamDetailsDirty();
    closeRosterEntryModal();
    renderRosters();
    const updatedRoster = setupState.rosters[teamSide];
    const players = getRosteredPlayers(updatedRoster);
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
    openRosterEntryModal(teamSide, playerId);
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
    const wasEditingRemovedPlayer = setupState.editingRosterPlayerId[teamSide] === playerId;
    if (setupState.editingRosterPlayerId[teamSide] === playerId) {
        setupState.editingRosterPlayerId[teamSide] = '';
    }
    markTeamDetailsDirty();
    if (wasEditingRemovedPlayer) {
        closeRosterEntryModal();
    }
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
    return getRosterForTeamId(teamId).filter((player) => player.isPlayer && player.rostered && !player.isLibero);
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
            teamB: {},
            courtRotationOffsets: {
                teamA: 0,
                teamB: 0
            }
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
        if (!lineupState.courtRotationOffsets || typeof lineupState.courtRotationOffsets !== 'object') {
            lineupState.courtRotationOffsets = {
                teamA: 0,
                teamB: 0
            };
        }
        if (!Number.isInteger(lineupState.courtRotationOffsets.teamA)) {
            lineupState.courtRotationOffsets.teamA = 0;
        }
        if (!Number.isInteger(lineupState.courtRotationOffsets.teamB)) {
            lineupState.courtRotationOffsets.teamB = 0;
        }
    }
    ensureSubstitutionStateForLineupState(setupState.lineupsBySet[setNumber]);
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
    setupState.courtRotationHistory = [];
    setupState.courtRotationRedoHistory = [];
    setupState.substitutionMode = {
        active: false,
        teamId: '',
        outgoingPosition: 0,
        requestPairs: []
    };
    setupState.substitutionInterruptionPairs = {
        teamA: [],
        teamB: []
    };
    setSubstitutionPanelNotice('', []);
    setLineupsFeedback('', '');
    setLineupsSubstitutionHint('', []);
}

function getCourtRotationSnapshotForCurrentSet() {
    const lineupState = ensureLineupStateForCurrentSet();
    return {
        teamA: Number(lineupState.courtRotationOffsets.teamA) || 0,
        teamB: Number(lineupState.courtRotationOffsets.teamB) || 0
    };
}

function restoreCourtRotationSnapshotForCurrentSet(snapshot) {
    const lineupState = ensureLineupStateForCurrentSet();
    lineupState.courtRotationOffsets.teamA = Number(snapshot?.teamA) || 0;
    lineupState.courtRotationOffsets.teamB = Number(snapshot?.teamB) || 0;
}

function rotateCourtDisplayForTeam(teamId) {
    const lineupState = ensureLineupStateForCurrentSet();
    const currentOffset = Number(lineupState.courtRotationOffsets[teamId]) || 0;
    lineupState.courtRotationOffsets[teamId] = (currentOffset + 1) % 6;
}

function resetCourtRotationHistory() {
    setupState.courtRotationHistory = [];
    setupState.courtRotationRedoHistory = [];
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
    clearSubstitutionInterruptionState();
    setSubstitutionPanelNotice('', []);
    const lineupState = ensureLineupStateForCurrentSet();
    lineupState.substitutions = {
        teamA: createEmptySubstitutionState(lineupState.teamA),
        teamB: createEmptySubstitutionState(lineupState.teamB)
    };
    lineupState.started = true;
    lineupState.locked = true;
}

function buildLineupOptionLabel(player) {
    return `#${player.shirtNumber} (${formatRosterListName(player)})`;
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
    const substitutionModeForTeam = setupState.substitutionMode.active && setupState.substitutionMode.teamId === teamId;
    const marker = getSubstitutionMarker(teamId, position);
    const sortedRoster = [...roster].sort((playerA, playerB) => {
        const selectedPosA = getSelectedLineupPosition(teamSelections, playerA.id);
        const selectedPosB = getSelectedLineupPosition(teamSelections, playerB.id);
        const isFreeA = selectedPosA === 0;
        const isFreeB = selectedPosB === 0;
        const isCurrentSelectionA = playerA.id === selectedPlayerId;
        const isCurrentSelectionB = playerB.id === selectedPlayerId;

        if (isFreeA !== isFreeB) {
            return isFreeA ? -1 : 1;
        }

        if (!isFreeA && !isFreeB && isCurrentSelectionA !== isCurrentSelectionB) {
            return isCurrentSelectionA ? -1 : 1;
        }

        if (!isFreeA && selectedPosA !== selectedPosB) {
            return selectedPosA - selectedPosB;
        }

        if (playerA.shirtNumber !== playerB.shirtNumber) {
            return playerA.shirtNumber - playerB.shirtNumber;
        }

        return formatRosterListName(playerA).localeCompare(formatRosterListName(playerB));
    });
    select.innerHTML = '';

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = substitutionModeForTeam ? 'Select substitute' : 'Select player';
    select.appendChild(placeholderOption);

    const allowedIncomingIds = substitutionModeForTeam ? new Set(getEligibleIncomingPlayersForPosition(teamId, position).map((player) => player.id)) : null;
    for (const player of sortedRoster) {
        if (substitutionModeForTeam && player.id !== selectedPlayerId && !allowedIncomingIds.has(player.id)) {
            continue;
        }
        const option = document.createElement('option');
        option.value = player.id;
        const baseLabel = buildLineupOptionLabel(player);
        const suffix = player.id === selectedPlayerId ? '' : getLineupOptionSuffix(teamSelections, position, player.id);
        option.textContent = suffix ? `${baseLabel}  ${suffix}` : baseLabel;
        select.appendChild(option);
    }

    select.value = selectedPlayerId || '';
    select.disabled = disabled;
    select.parentElement.classList.toggle('lineup-sub-active', marker.className === 'lineup-sub-active');
    select.parentElement.classList.toggle('lineup-sub-locked', marker.className === 'lineup-sub-locked');
    const label = select.parentElement.querySelector('label');
    if (label) {
        label.textContent = marker.text ? `Position ${position} (${marker.text})` : `Position ${position}`;
    }
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

    const baseReadOnly = (lineupState.locked && !setupState.substitutionMode.active) || mygame.isGameOver || !setupState.prematchTossConfirmed;

    for (let position = 1; position <= 6; position++) {
        const readOnlyTeamA = baseReadOnly
            || (setupState.substitutionMode.active && (setupState.substitutionMode.teamId !== 'teamA' || !getEligibleIncomingPlayersForPosition('teamA', position).length));
        const readOnlyTeamB = baseReadOnly
            || (setupState.substitutionMode.active && (setupState.substitutionMode.teamId !== 'teamB' || !getEligibleIncomingPlayersForPosition('teamB', position).length));
        renderLineupSelect('teamA', position, lineupState.teamA[position] || '', readOnlyTeamA);
        renderLineupSelect('teamB', position, lineupState.teamB[position] || '', readOnlyTeamB);
    }

    if (setupState.substitutionMode.active) {
        const teamLabel = getTeamLabelOrFallback(setupState.substitutionMode.teamId);
        setLineupsSubstitutionHint(
            `${teamLabel} substitution mode: choose one eligible on-court position and select a legal replacement. ${getRemainingSubsForCurrentSet(setupState.substitutionMode.teamId)} substitution(s) remaining this set.`,
            getUnavailableBenchReasons(setupState.substitutionMode.teamId)
        );
    } else if (setupState.substitutionPanelNotice.message) {
        setLineupsSubstitutionHint(
            setupState.substitutionPanelNotice.message,
            setupState.substitutionPanelNotice.items
        );
    } else {
        setLineupsSubstitutionHint('', []);
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

function startSubstitutionMode(teamId) {
    if (setupState.substitutionMode.active && setupState.substitutionMode.teamId === teamId) {
        setActivePanel('lineups');
        return;
    }
    if (setupState.substitutionMode.active && setupState.substitutionMode.teamId !== teamId) {
        setLineupsFeedback(`Finish ${getTeamLabelOrFallback(setupState.substitutionMode.teamId)} substitution request before starting another.`, 'error');
        setActivePanel('lineups');
        return;
    }
    if (!setupState.matchStarted || mygame.isGameOver || !currentSetStarted()) {
        setSetupFeedback('Start the current set before recording a substitution.', 'error');
        return;
    }
    if (getRemainingSubsForCurrentSet(teamId) <= 0) {
        setSetupFeedback(`${getTeamLabelOrFallback(teamId)} has no substitutions remaining in this set.`, 'error');
        return;
    }
    if (!hasAnyEligibleSubstitutionPosition(teamId)) {
        setSetupFeedback(`${getTeamLabelOrFallback(teamId)} has no legal substitutions available right now.`, 'error');
        return;
    }
    setupState.substitutionMode = {
        active: true,
        teamId,
        outgoingPosition: 0,
        requestPairs: Array.isArray(setupState.substitutionInterruptionPairs[teamId])
            ? [...setupState.substitutionInterruptionPairs[teamId]]
            : []
    };
    setSubstitutionPanelNotice('', []);
    setActivePanel('lineups');
    setLineupsFeedback(`Substitution mode: choose a legal ${getTeamLabelOrFallback(teamId)} substitution and confirm it.`, '');
    renderLineupsPanel();
    updateActionAvailability();
}

function cancelSubstitutionMode() {
    if (!setupState.substitutionMode.active) {
        return;
    }
    setupState.substitutionMode = {
        active: false,
        teamId: '',
        outgoingPosition: 0,
        requestPairs: []
    };
    renderLineupsPanel();
    updateActionAvailability();
}

function clearSubstitutionInterruptionState() {
    setupState.substitutionInterruptionPairs = {
        teamA: [],
        teamB: []
    };
}

function applySubstitutionForCurrentSet() {
    const teamId = setupState.substitutionMode.teamId;
    const lineupState = ensureLineupStateForCurrentSet();
    const originalSelections = { ...(lineupState[teamId] || {}) };
    const updatedSelections = getLineupSelectionsFromForm(teamId);
    const changedPositions = [];
    for (let position = 1; position <= 6; position++) {
        if ((originalSelections[position] || '') !== (updatedSelections[position] || '')) {
            changedPositions.push(position);
        }
    }
    if (changedPositions.length !== 1) {
        setLineupsFeedback('A substitution must change exactly one on-court position.', 'error');
        return;
    }

    const position = changedPositions[0];
    const outgoingPlayerId = originalSelections[position] || '';
    const incomingPlayerId = updatedSelections[position] || '';
    const eligibleIncoming = getEligibleIncomingPlayersForPosition(teamId, position).map((player) => player.id);
    if (!outgoingPlayerId || !incomingPlayerId || !eligibleIncoming.includes(incomingPlayerId)) {
        setLineupsFeedback('Selected substitution is not legal for that position.', 'error');
        return;
    }

    const substitutionState = getSubstitutionStateForCurrentSet(teamId);
    const positionState = substitutionState.positions[position];
    const substitutionKind = positionState.substitutePlayerId && positionState.currentPlayerId === positionState.substitutePlayerId
        ? 'return'
        : 'regular';

    lineupState[teamId][position] = incomingPlayerId;
    positionState.currentPlayerId = incomingPlayerId;
    if (substitutionKind === 'regular') {
        positionState.substitutePlayerId = incomingPlayerId;
        const requestPair = {
            position,
            originalPlayerId: outgoingPlayerId,
            substitutePlayerId: incomingPlayerId
        };
        if (setupState.substitutionMode.active && setupState.substitutionMode.teamId === teamId) {
            setupState.substitutionMode.requestPairs.push(requestPair);
        }
        if (!Array.isArray(setupState.substitutionInterruptionPairs[teamId])) {
            setupState.substitutionInterruptionPairs[teamId] = [];
        }
        setupState.substitutionInterruptionPairs[teamId].push(requestPair);
    } else {
        positionState.closed = true;
    }
    substitutionState.used += 1;

    const outgoingPlayer = getRosterForTeamId(teamId).find((player) => player.id === outgoingPlayerId);
    const incomingPlayer = getRosterForTeamId(teamId).find((player) => player.id === incomingPlayerId);
    const score = getScoreNotationForTeam(teamId);
    mygame.recordSubstitution(
        getCurrentSetNumberForLineup(),
        teamId,
        score,
        outgoingPlayerId,
        incomingPlayerId,
        outgoingPlayer ? buildLineupOptionLabel(outgoingPlayer) : outgoingPlayerId,
        incomingPlayer ? buildLineupOptionLabel(incomingPlayer) : incomingPlayerId,
        substitutionKind
    );
    mygame.addExternalEvent('substitution_applied', {
        setNumber: getCurrentSetNumberForLineup(),
        team: teamId,
        score,
        position,
        playerOutId: outgoingPlayerId,
        playerInId: incomingPlayerId,
        substitutionKind
    });

    const keepSubstitutionModeActive = getRemainingSubsForCurrentSet(teamId) > 0 && hasAnyEligibleSubstitutionPosition(teamId);
    if (keepSubstitutionModeActive) {
        setupState.substitutionMode = {
            active: true,
            teamId,
            outgoingPosition: 0,
            requestPairs: setupState.substitutionMode.requestPairs
        };
        setLineupsFeedback(`${getTeamLabelOrFallback(teamId)} substitution recorded at ${score}. Select the next legal substitution or press SUBS DONE when finished.`, 'success');
    } else {
        const remainingSubs = getRemainingSubsForCurrentSet(teamId);
        cancelSubstitutionMode();
        if (remainingSubs <= 0) {
            setSubstitutionPanelNotice(
                `${getTeamLabelOrFallback(teamId)} has reached the maximum of ${getMaxSubsPerSet()} substitutions for this set.`,
                getUnavailableBenchReasons(teamId)
            );
        } else {
            setSubstitutionPanelNotice(
                `${getTeamLabelOrFallback(teamId)} has no further legal substitutions available right now.`,
                getUnavailableBenchReasons(teamId)
            );
        }
        setLineupsFeedback(`${getTeamLabelOrFallback(teamId)} substitution recorded at ${score}.`, 'success');
    }
    updateSetsElements();
}

function applyLineupsForCurrentSet() {
    if (setupState.substitutionMode.active) {
        applySubstitutionForCurrentSet();
        return;
    }
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

    if (setupState.substitutionMode.active) {
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

function getTimeoutsForSet(setNumber) {
    return mygame.getTimeoutsForSet(setNumber);
}

function getMaxTimeoutsForCurrentSet() {
    return mygame.isDeciderSet()
        ? mygame.fixture.rules.maxTimeoutsDeciderSet
        : mygame.fixture.rules.maxTimeoutsRegularSet;
}

function getMaxSubsPerSet() {
    return Number(mygame.fixture.rules.maxSubsPerSet) || 6;
}

function getSubstitutionsForSet(setNumber) {
    return mygame.getSubstitutionsForSet(setNumber);
}

function getSubstitutionsForCurrentSet(team) {
    const currentSetNumber = getCurrentSetNumberForLineup();
    return getSubstitutionsForSet(currentSetNumber).filter((entry) => entry.team === team);
}

function getUsedSubsForCurrentSet(team) {
    return getSubstitutionsForCurrentSet(team).length;
}

function getRemainingSubsForCurrentSet(team) {
    return Math.max(0, getMaxSubsPerSet() - getUsedSubsForCurrentSet(team));
}

function getSubUsageLabel(team) {
    return `${getUsedSubsForCurrentSet(team)} / ${getMaxSubsPerSet()}`;
}

function getUsedTimeoutsForCurrentSet(team) {
    const currentSetNumber = getCurrentSetNumberForLineup();
    return getTimeoutsForSet(currentSetNumber).filter((entry) => entry.team === team).length;
}

function getRemainingTimeoutsForCurrentSet(team) {
    return Math.max(0, getMaxTimeoutsForCurrentSet() - getUsedTimeoutsForCurrentSet(team));
}

function getTimeoutUsageLabel(team) {
    return `${getUsedTimeoutsForCurrentSet(team)} / ${getMaxTimeoutsForCurrentSet()}`;
}

function getTimeoutScoreNotation(team) {
    if (team === 'teamA') {
        return `${mygame.currentSet.teamA}-${mygame.currentSet.teamB}`;
    }
    return `${mygame.currentSet.teamB}-${mygame.currentSet.teamA}`;
}

function getScoreNotationForTeam(team) {
    if (team === 'teamA') {
        return `${mygame.currentSet.teamA}-${mygame.currentSet.teamB}`;
    }
    return `${mygame.currentSet.teamB}-${mygame.currentSet.teamA}`;
}

function createEmptySubstitutionState(teamSelections = {}) {
    const positions = {};
    for (let position = 1; position <= 6; position++) {
        const playerId = teamSelections[position] || '';
        positions[position] = {
            originalPlayerId: playerId,
            currentPlayerId: playerId,
            substitutePlayerId: '',
            closed: false
        };
    }
    return {
        used: 0,
        positions
    };
}

function ensureSubstitutionStateForLineupState(lineupState) {
    if (!lineupState.substitutions || typeof lineupState.substitutions !== 'object') {
        lineupState.substitutions = {
            teamA: createEmptySubstitutionState(lineupState.teamA),
            teamB: createEmptySubstitutionState(lineupState.teamB)
        };
    }
    for (const teamId of ['teamA', 'teamB']) {
        if (!lineupState.substitutions[teamId] || typeof lineupState.substitutions[teamId] !== 'object') {
            lineupState.substitutions[teamId] = createEmptySubstitutionState(lineupState[teamId]);
        }
        const teamState = lineupState.substitutions[teamId];
        if (!Number.isInteger(teamState.used) || teamState.used < 0) {
            teamState.used = 0;
        }
        if (!teamState.positions || typeof teamState.positions !== 'object') {
            teamState.positions = {};
        }
        for (let position = 1; position <= 6; position++) {
            const fallbackPlayerId = lineupState[teamId][position] || '';
            const current = teamState.positions[position];
            if (!current || typeof current !== 'object') {
                teamState.positions[position] = {
                    originalPlayerId: fallbackPlayerId,
                    currentPlayerId: fallbackPlayerId,
                    substitutePlayerId: '',
                    closed: false
                };
                continue;
            }
            if (typeof current.originalPlayerId !== 'string') {
                current.originalPlayerId = fallbackPlayerId;
            }
            if (typeof current.currentPlayerId !== 'string') {
                current.currentPlayerId = fallbackPlayerId;
            }
            if (typeof current.substitutePlayerId !== 'string') {
                current.substitutePlayerId = '';
            }
            current.closed = Boolean(current.closed);
        }
    }
}

function getSubstitutionStateForCurrentSet(teamId) {
    const lineupState = ensureLineupStateForCurrentSet();
    ensureSubstitutionStateForLineupState(lineupState);
    return lineupState.substitutions[teamId];
}

function getCurrentOnCourtPlayerIds(teamId) {
    const lineupState = ensureLineupStateForCurrentSet();
    return new Set(Object.values(lineupState[teamId] || {}).filter(Boolean));
}

function getPositionStateForTeam(teamId, position) {
    const substitutionState = getSubstitutionStateForCurrentSet(teamId);
    return substitutionState.positions[position];
}

function isPlayerFreshBenchCandidate(teamId, playerId) {
    const substitutionState = getSubstitutionStateForCurrentSet(teamId);
    for (let position = 1; position <= 6; position++) {
        const state = substitutionState.positions[position];
        if (!state) {
            continue;
        }
        if (state.originalPlayerId === playerId || state.substitutePlayerId === playerId) {
            return false;
        }
    }
    return true;
}

function getEligibleIncomingPlayersForPosition(teamId, position) {
    const substitutionState = getSubstitutionStateForCurrentSet(teamId);
    const positionState = substitutionState.positions[position];
    if (!positionState || positionState.closed || substitutionState.used >= getMaxSubsPerSet()) {
        return [];
    }
    const onCourtIds = getCurrentOnCourtPlayerIds(teamId);
    const benchPlayers = getNonLiberoRosterForTeamId(teamId).filter((player) => !onCourtIds.has(player.id));

    if (positionState.substitutePlayerId && positionState.currentPlayerId === positionState.substitutePlayerId) {
        const isCurrentInterruptionPair = Array.isArray(setupState.substitutionInterruptionPairs[teamId])
            && setupState.substitutionInterruptionPairs[teamId].some((pair) =>
                pair.position === position
                && pair.originalPlayerId === positionState.originalPlayerId
                && pair.substitutePlayerId === positionState.substitutePlayerId
            );
        if (isCurrentInterruptionPair) {
            return [];
        }
        return benchPlayers.filter((player) => player.id === positionState.originalPlayerId);
    }

    if (!positionState.substitutePlayerId && positionState.currentPlayerId === positionState.originalPlayerId) {
        return benchPlayers.filter((player) => isPlayerFreshBenchCandidate(teamId, player.id));
    }

    return [];
}

function getSubstitutionMarker(teamId, position) {
    const state = getPositionStateForTeam(teamId, position);
    if (!state) {
        return { text: '', className: '' };
    }
    const originalPlayer = getRosterForTeamId(teamId).find((player) => player.id === state.originalPlayerId);
    const substitutePlayer = getRosterForTeamId(teamId).find((player) => player.id === state.substitutePlayerId);
    const originalLabel = originalPlayer ? `#${originalPlayer.shirtNumber}` : 'original player';
    const substituteLabel = substitutePlayer ? `#${substitutePlayer.shirtNumber}` : 'substitute';
    if (state.closed) {
        if (state.currentPlayerId === state.originalPlayerId) {
            return { text: `Returned for ${substituteLabel}; no further sub`, className: 'lineup-sub-locked' };
        }
        return { text: `SUB IN for ${originalLabel}; no further sub`, className: 'lineup-sub-locked' };
    }
    if (state.substitutePlayerId && state.currentPlayerId === state.substitutePlayerId) {
        return { text: `SUB IN for ${originalLabel}`, className: 'lineup-sub-active' };
    }
    return { text: '', className: '' };
}

function getUnavailableBenchReasons(teamId) {
    const reasons = [];
    const onCourtIds = getCurrentOnCourtPlayerIds(teamId);
    const substitutionState = getSubstitutionStateForCurrentSet(teamId);
    for (const player of getNonLiberoRosterForTeamId(teamId)) {
        if (onCourtIds.has(player.id)) {
            continue;
        }
        let reason = '';
        for (let position = 1; position <= 6; position++) {
            const state = substitutionState.positions[position];
            if (!state) {
                continue;
            }
            if (state.closed && (state.originalPlayerId === player.id || state.substitutePlayerId === player.id)) {
                reason = 'pair already completed';
                break;
            }
            if (state.substitutePlayerId === player.id) {
                reason = 'substitute already used in this set';
                break;
            }
            if (state.originalPlayerId === player.id && state.substitutePlayerId && state.currentPlayerId !== player.id) {
                const blockedByCurrentInterruption = Array.isArray(setupState.substitutionInterruptionPairs[teamId])
                    && setupState.substitutionInterruptionPairs[teamId].some((pair) =>
                        pair.position === position
                        && pair.originalPlayerId === state.originalPlayerId
                        && pair.substitutePlayerId === state.substitutePlayerId
                    );
                reason = blockedByCurrentInterruption
                    ? 'cannot return in the same substitution request'
                    : 'can only return for own replacement';
                break;
            }
        }
        if (reason) {
            reasons.push(`${buildLineupOptionLabel(player)}: ${reason}`);
        }
    }
    return reasons.sort((a, b) => a.localeCompare(b));
}

function hasAnyEligibleSubstitutionPosition(teamId) {
    for (let position = 1; position <= 6; position++) {
        if (getEligibleIncomingPlayersForPosition(teamId, position).length > 0) {
            return true;
        }
    }
    return false;
}

function recordTimeoutForTeam(team) {
    if (!setupState.matchStarted || mygame.isGameOver || !currentSetStarted()) {
        setSetupFeedback('Start the current set before recording a timeout.', 'error');
        return;
    }

    if (getRemainingTimeoutsForCurrentSet(team) <= 0) {
        setSetupFeedback(`${getTeamLabelOrFallback(team)} has no timeouts remaining in this set.`, 'error');
        return;
    }

    const currentSetNumber = getCurrentSetNumberForLineup();
    const score = getTimeoutScoreNotation(team);
    mygame.recordTimeout(currentSetNumber, team, score);
    setSetupFeedback(`${getTeamLabelOrFallback(team)} timeout recorded at ${score}.`, 'success');
    updateSetsElements();
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
        maxTimeoutsRegularSet: asPositiveInteger(rawValues.maxTimeoutsRegularSet ?? 2, 'Max timeouts in regular set', 0),
        maxTimeoutsDeciderSet: asPositiveInteger(rawValues.maxTimeoutsDeciderSet ?? 2, 'Max timeouts in decider set', 0),
        maxSubsPerSet: asPositiveInteger(rawValues.maxSubsPerSet ?? 6, 'Max substitutions per set', 0),
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
        `Timeouts: ${values.maxTimeoutsRegularSet}/${values.maxTimeoutsDeciderSet} reg/decider`,
        `Subs/set: ${values.maxSubsPerSet}`,
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
    elements.maxTimeoutsRegularSet.value = ruleValues.maxTimeoutsRegularSet;
    elements.maxTimeoutsDeciderSet.value = ruleValues.maxTimeoutsDeciderSet;
    elements.maxSubsPerSet.value = ruleValues.maxSubsPerSet;
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
        maxTimeoutsRegularSet: elements.maxTimeoutsRegularSet.value,
        maxTimeoutsDeciderSet: elements.maxTimeoutsDeciderSet.value,
        maxSubsPerSet: elements.maxSubsPerSet.value,
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
        ruleValues.breakBetweenSetsMins,
        ruleValues.maxTimeoutsRegularSet,
        ruleValues.maxTimeoutsDeciderSet,
        ruleValues.maxSubsPerSet
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
        elements.maxTimeoutsRegularSet,
        elements.maxTimeoutsDeciderSet,
        elements.maxSubsPerSet,
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
        elements.maxTimeoutsRegularSet,
        elements.maxTimeoutsDeciderSet,
        elements.maxSubsPerSet,
        elements.allowPlayerStaffRoleCumulation
    ];

    for (const input of prematchInputs) {
        input.disabled = true;
    }

    for (const input of [
        elements.rosterEntryFirstName,
        elements.rosterEntryLastName,
        elements.rosterEntryIsPlayer,
        elements.rosterEntryRostered,
        elements.rosterEntryNumber,
        elements.rosterEntryRegNumber,
        elements.rosterEntryBenchRole,
        elements.rosterEntryLibero,
        elements.rosterEntryCaptain
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

function getScoreboardTeamTitle(teamId) {
    const sideLabel = teamId === 'teamA' ? 'Team A' : 'Team B';
    const teamName = mygame.getTeamName(teamId);
    if (teamName && teamName !== 'Unknown') {
        return `${teamName} (${sideLabel})`;
    }

    return sideLabel;
}

function getDisplayedLineupSelections(teamId) {
    const lineupState = ensureLineupStateForCurrentSet();
    const baseSelections = lineupState[teamId] || {};
    const rotationOffset = Number(lineupState.courtRotationOffsets[teamId]) || 0;
    const displayedSelections = {};

    for (let position = 1; position <= 6; position++) {
        const mappedBasePosition = ((position + rotationOffset - 1) % 6) + 1;
        displayedSelections[position] = baseSelections[mappedBasePosition] || '';
    }

    return displayedSelections;
}

function renderScoreboardCourt(teamId, container) {
    const roster = getNonLiberoRosterForTeamId(teamId);
    const byId = new Map(roster.map((player) => [player.id, player]));
    const displayedSelections = getDisplayedLineupSelections(teamId);
    const scorerViewCells = [4, 3, 2, 5, 6, 1];

    container.innerHTML = scorerViewCells.map((position) => {
        const playerId = displayedSelections[position] || '';
        const player = playerId ? byId.get(playerId) || null : null;
        const shirtNumber = player && Number.isInteger(player.shirtNumber) ? `#${player.shirtNumber}` : '—';
        const hoverName = player ? escapeHtml(getRosterHoverName(player)) : '';
        return `
            <div class="scoreboard-court-cell${player ? '' : ' scoreboard-court-empty'}"${hoverName ? ` title="${hoverName}"` : ''}>
                <span class="scoreboard-court-position">P${position}</span>
                <span class="scoreboard-court-number">${shirtNumber}</span>
            </div>
        `;
    }).join('');
}

function updateScoringServingValues() {
    elements.scoreboardTeamATitle.textContent = getScoreboardTeamTitle('teamA');
    elements.scoreboardTeamBTitle.textContent = getScoreboardTeamTitle('teamB');
    renderScoreboardCourt('teamA', elements.scoreboardCourtTeamA);
    renderScoreboardCourt('teamB', elements.scoreboardCourtTeamB);
    elements.gameStatusTeamALabel.textContent = getScoreboardTeamTitle('teamA');
    elements.gameStatusTeamBLabel.textContent = getScoreboardTeamTitle('teamB');

    elements.scoreTeamA.textContent = mygame.currentSet.teamA;
    elements.scoreTeamB.textContent = mygame.currentSet.teamB;
    elements.setsTeamA.textContent = mygame.setWins.teamA;
    elements.setsTeamB.textContent = mygame.setWins.teamB;
    elements.pointsTeamA.textContent = mygame.totalPoints.teamA;
    elements.pointsTeamB.textContent = mygame.totalPoints.teamB;
    elements.timeoutsLeftTeamA.textContent = getTimeoutUsageLabel('teamA');
    elements.timeoutsLeftTeamB.textContent = getTimeoutUsageLabel('teamB');
    elements.subsUsedTeamA.textContent = getSubUsageLabel('teamA');
    elements.subsUsedTeamB.textContent = getSubUsageLabel('teamB');

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
    elements.addHomePlayer.disabled = setupState.matchStarted || !setupState.rulesConfirmed;
    elements.addAwayPlayer.disabled = setupState.matchStarted || !setupState.rulesConfirmed;

    const canManageSet = setupState.matchStarted && !mygame.isGameOver && currentSetStarted();
    const canScore = canManageSet && mygame.team_serving_currently !== 'Unknown';
    const canUndo = canManageSet && mygame.pointHistory.length > 0;
    const canRedo = canManageSet && mygame.redoHistory.length > 0;
    const canTimeoutTeamA = canManageSet && getRemainingTimeoutsForCurrentSet('teamA') > 0;
    const canTimeoutTeamB = canManageSet && getRemainingTimeoutsForCurrentSet('teamB') > 0;
    const canSubTeamA = canManageSet && !setupState.substitutionMode.active && getRemainingSubsForCurrentSet('teamA') > 0;
    const canSubTeamB = canManageSet && !setupState.substitutionMode.active && getRemainingSubsForCurrentSet('teamB') > 0;

    elements.incTeamA.disabled = !canScore;
    elements.incTeamB.disabled = !canScore;
    elements.timeoutTeamA.disabled = !canTimeoutTeamA;
    elements.timeoutTeamB.disabled = !canTimeoutTeamB;
    elements.subTeamA.disabled = !canSubTeamA;
    elements.subTeamB.disabled = !canSubTeamB;
    elements.subTeamA.textContent = 'SUB';
    elements.subTeamB.textContent = 'SUB';
    elements.undoLastPoint.disabled = !canUndo;
    elements.redoLastPoint.disabled = !canRedo;
    elements.completeSet.disabled = !canManageSet;
    elements.completeGame.disabled = !canManageSet;
    const deciderTossRequired = setupState.matchStarted && !mygame.isGameOver && mygame.isPreDeciderToss;
    elements.applyDeciderToss.disabled = !deciderTossRequired;
    elements.applyLineups.disabled = !setupState.prematchTossConfirmed || mygame.isGameOver || lineupState.locked;
    if (setupState.substitutionMode.active) {
        elements.applyLineups.disabled = !canManageSet;
        elements.applyLineups.textContent = 'Confirm Substitution';
        elements.doneSubstitutions.disabled = !canManageSet;
        elements.doneSubstitutions.classList.remove('hidden');
    } else {
        elements.applyLineups.textContent = 'Apply Lineups For Set';
        elements.doneSubstitutions.disabled = true;
        elements.doneSubstitutions.classList.add('hidden');
    }
    elements.importRulesJson.disabled = setupState.matchStarted;
    elements.importHomeRosterJson.disabled = setupState.matchStarted;
    elements.importAwayRosterJson.disabled = setupState.matchStarted;
    elements.exportRulesJson.disabled = false;
    elements.exportHomeRosterJson.disabled = false;
    elements.exportAwayRosterJson.disabled = false;
    if (setupState.rosterEditor.open) {
        updateRosterEntryModalUi();
    }
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
    resetCourtRotationHistory();
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
    resetCourtRotationHistory();
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

    elements.addHomePlayer.addEventListener('click', () => openRosterEntryModal('home'));
    elements.addAwayPlayer.addEventListener('click', () => openRosterEntryModal('away'));
    elements.closeRosterEntryModal.addEventListener('click', closeRosterEntryModal);
    elements.cancelRosterEntry.addEventListener('click', closeRosterEntryModal);
    elements.saveRosterEntry.addEventListener('click', () => addRosterPlayer(setupState.rosterEditor.teamSide));
    elements.removeRosterEntry.addEventListener('click', () => {
        const teamSide = setupState.rosterEditor.teamSide;
        const playerId = setupState.editingRosterPlayerId[teamSide];
        if (playerId) {
            removeRosterPlayer(teamSide, playerId);
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && setupState.rosterEditor.open) {
            closeRosterEntryModal();
        }
    });
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
        const button = event.target.closest('.edit-player-btn, .roster-player-btn, .unroster-player-btn');
        if (!button) {
            return;
        }
        if (button.classList.contains('edit-player-btn')) {
            editRosterPlayer(button.dataset.team, button.dataset.playerId);
            return;
        }
        if (button.classList.contains('roster-player-btn')) {
            toggleRosteredStatus(button.dataset.team, button.dataset.playerId, true);
            return;
        }
        toggleRosteredStatus(button.dataset.team, button.dataset.playerId, false);
    };
    for (const body of [
        elements.homeBenchRosterBody,
        elements.homeRegularRosterBody,
        elements.homeLiberoRosterBody,
        elements.homeUnrosteredRosterBody,
        elements.awayBenchRosterBody,
        elements.awayRegularRosterBody,
        elements.awayLiberoRosterBody,
        elements.awayUnrosteredRosterBody
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
            if (!setupState.substitutionMode.active) {
                renderLineupsPanel();
            }
            updateSetupBadge();
            updateActionAvailability();
        });
    }

    elements.completeSet.addEventListener('click', completeCurrentSet);
    elements.completeGame.addEventListener('click', interruptGame);

    elements.incTeamA.addEventListener('click', () => {
        cancelSubstitutionMode();
        clearSubstitutionInterruptionState();
        setSubstitutionPanelNotice('', []);
        const previousServingTeam = mygame.team_serving_currently;
        const rotationSnapshot = getCourtRotationSnapshotForCurrentSet();
        const pointAwarded = mygame.awardPoint('teamA');
        if (pointAwarded) {
            setupState.courtRotationHistory.push(rotationSnapshot);
            setupState.courtRotationRedoHistory = [];
            if (previousServingTeam !== 'teamA' && previousServingTeam !== 'Unknown') {
                rotateCourtDisplayForTeam('teamA');
            }
        }
        updateSetsElements();
    });

    elements.incTeamB.addEventListener('click', () => {
        cancelSubstitutionMode();
        clearSubstitutionInterruptionState();
        setSubstitutionPanelNotice('', []);
        const previousServingTeam = mygame.team_serving_currently;
        const rotationSnapshot = getCourtRotationSnapshotForCurrentSet();
        const pointAwarded = mygame.awardPoint('teamB');
        if (pointAwarded) {
            setupState.courtRotationHistory.push(rotationSnapshot);
            setupState.courtRotationRedoHistory = [];
            if (previousServingTeam !== 'teamB' && previousServingTeam !== 'Unknown') {
                rotateCourtDisplayForTeam('teamB');
            }
        }
        updateSetsElements();
    });

    elements.timeoutTeamA.addEventListener('click', () => {
        recordTimeoutForTeam('teamA');
    });

    elements.timeoutTeamB.addEventListener('click', () => {
        recordTimeoutForTeam('teamB');
    });

    elements.subTeamA.addEventListener('click', () => {
        startSubstitutionMode('teamA');
    });

    elements.subTeamB.addEventListener('click', () => {
        startSubstitutionMode('teamB');
    });

    elements.doneSubstitutions.addEventListener('click', () => {
        setSubstitutionPanelNotice('', []);
        cancelSubstitutionMode();
        setLineupsFeedback('Substitution request finished.', '');
    });

    elements.undoLastPoint.addEventListener('click', () => {
        const currentRotationSnapshot = getCourtRotationSnapshotForCurrentSet();
        const pointUndone = mygame.undoLastPoint();
        if (pointUndone) {
            setupState.courtRotationRedoHistory.push(currentRotationSnapshot);
            const previousRotationSnapshot = setupState.courtRotationHistory.pop();
            if (previousRotationSnapshot) {
                restoreCourtRotationSnapshotForCurrentSet(previousRotationSnapshot);
            } else {
                restoreCourtRotationSnapshotForCurrentSet({ teamA: 0, teamB: 0 });
            }
        }
        updateSetsElements();
    });

    elements.redoLastPoint.addEventListener('click', () => {
        const currentRotationSnapshot = getCourtRotationSnapshotForCurrentSet();
        const pointRedone = mygame.redoLastPoint();
        if (pointRedone) {
            setupState.courtRotationHistory.push(currentRotationSnapshot);
            const redoRotationSnapshot = setupState.courtRotationRedoHistory.pop();
            if (redoRotationSnapshot) {
                restoreCourtRotationSnapshotForCurrentSet(redoRotationSnapshot);
            }
        }
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
        elements.maxTimeoutsRegularSet,
        elements.maxTimeoutsDeciderSet,
        elements.maxSubsPerSet,
        elements.allowPlayerStaffRoleCumulation
    ]) {
        input.addEventListener('change', markRulesDirty);
    }

    elements.rosterEntryIsPlayer.addEventListener('change', () => {
        updateRosterEntryModalUi();
        updateActionAvailability();
    });
    elements.rosterEntryRostered.addEventListener('change', () => {
        updateRosterEntryModalUi();
        updateActionAvailability();
    });

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
    setupState.rosterEditor.open = false;
    setupState.rosterEditor.teamSide = 'home';
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
    closeRosterEntryModal();

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
