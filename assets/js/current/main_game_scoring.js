import Fixture from '../core/Fixture.js';
import Rules from '../core/Rules.js';
import Game from '../core/Game.js';

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
            minliberoifthirteen: 1
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
            minliberoifthirteen: 2
        }
    }
};

const DEFAULT_PROFILE_ID = 'preset:london_league';
const RULE_PROFILE_STORAGE_KEY = 'volleyball_rules_profiles_v1';
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
    matchStarted: false,
    setupLocked: false,
    deciderPromptShown: false,
    deciderLeftStarter: ''
};

const elements = {
    setupPanel: document.getElementById('setup-panel'),
    rulesPanel: document.getElementById('rules-panel'),
    toggleSetupPanel: document.getElementById('toggle-setup-panel'),
    toggleRulesPanel: document.getElementById('toggle-rules-panel'),
    setupStatusBadge: document.getElementById('setup-status-badge'),
    rulesStatusBadge: document.getElementById('rules-status-badge'),
    setupFeedback: document.getElementById('setup-feedback'),
    rulesFeedback: document.getElementById('rules-feedback'),
    startMatch: document.getElementById('start-match'),
    rulesProfile: document.getElementById('rules-profile'),
    applyRulesProfile: document.getElementById('apply-rules-profile'),
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
    deciderCard: document.getElementById('decider-toss-card'),
    deciderLeftTeam: document.getElementById('decider-left-team'),
    deciderServingTeam: document.getElementById('decider-serving-team'),
    applyDeciderToss: document.getElementById('apply-decider-toss')
};

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
        minliberoifthirteen: asPositiveInteger(rawValues.minliberoifthirteen, 'Min liberos if 13 players', 0)
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
        `Min libero if 13: ${values.minliberoifthirteen}`
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
        minliberoifthirteen: elements.minliberoifthirteen.value
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
        ruleValues.minliberoifthirteen
    );
}

function updateRulesPanelView() {
    const selectedProfile = parseProfileSelection(elements.rulesProfile.value);
    const isCustom = selectedProfile.type === 'custom';
    const isSavedProfile = selectedProfile.type === 'saved';
    elements.customRulesCard.classList.toggle('hidden', !isCustom);

    if (isCustom) {
        elements.rulesPresetSummary.textContent = `Custom profile. ${setupState.rulesSource === 'custom' ? 'Saved values are loaded below.' : 'Edit values below and save.'}`;
    } else if (selectedProfile.type === 'preset' || selectedProfile.type === 'saved') {
        elements.rulesPresetSummary.textContent = `${selectedProfile.label}: ${getPresetSummaryLine(selectedProfile.values)}`;
        setRulesFormValues(selectedProfile.values);
    } else {
        elements.rulesPresetSummary.textContent = 'Unknown profile selected.';
    }

    elements.saveRulesProfile.disabled = setupState.matchStarted || !isCustom;
    elements.newRulesProfileName.disabled = setupState.matchStarted || !isCustom;
    elements.deleteRulesProfile.disabled = setupState.matchStarted || !isSavedProfile;
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

function hasReadySelections() {
    const selections = getSetupSelections();
    return (
        setupState.rulesConfirmed &&
        selections.homeName.length > 0 &&
        selections.awayName.length > 0 &&
        selections.leftStarter.length > 0 &&
        selections.firstServer.length > 0
    );
}

function validateBeforeStart() {
    if (!setupState.rulesConfirmed) {
        setSetupFeedback('Rules are required. Apply a preset or save custom rules first.', 'error');
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
    elements.startMatch.disabled = true;

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
        elements.minliberoifthirteen
    ];

    for (const input of prematchInputs) {
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
}

function updateSetupBadge() {
    elements.setupStatusBadge.classList.remove('ready', 'locked');
    const deciderTossRequired = setupState.matchStarted && !mygame.isGameOver && mygame.isPreDeciderToss;

    if (deciderTossRequired) {
        elements.setupStatusBadge.textContent = 'Decider Toss Required';
        elements.setupStatusBadge.classList.add('locked');
        return;
    }

    if (setupState.matchStarted) {
        elements.setupStatusBadge.textContent = 'Toss Choices Locked';
        elements.setupStatusBadge.classList.add('locked');
        return;
    }

    if (hasReadySelections()) {
        elements.setupStatusBadge.textContent = `Ready (${setupState.rulesProfileLabel})`;
        elements.setupStatusBadge.classList.add('ready');
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
        elements.gameStatus.textContent = 'Toss choices required before match start.';
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
            elements.setupPanel.classList.remove('hidden');
            elements.rulesPanel.classList.add('hidden');
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

function updateActionAvailability() {
    elements.startMatch.disabled = setupState.matchStarted || !hasReadySelections();

    const canManageSet = setupState.matchStarted && !mygame.isGameOver;
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
}

function updateSetsElements() {
    updateTeamPosition();
    updateScoringServingValues();
    updateDeciderTossVisibility();
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

    setRulesFeedback(`${selection.label} rules applied.`, 'success');
    setSetupFeedback('Rules profile applied. Complete remaining setup fields to start match.', 'success');
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

        setRulesFeedback('Custom rules saved and confirmed.', 'success');
        setSetupFeedback('Custom rules saved. Complete remaining setup fields to start match.', 'success');
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

    if (selectedProfile.type === 'custom') {
        setupState.rulesProfileLabel = 'Custom';
        setRulesFeedback('Custom profile selected. Edit values and save to confirm.', '');
    } else {
        setupState.rulesProfileLabel = selectedProfile.type === 'unknown' ? 'Not Set' : selectedProfile.label;
        setRulesFeedback('Profile selected. Click Apply Profile to confirm rules.', '');
    }

    updateSetsElements();
}

function startMatch() {
    if (setupState.matchStarted) {
        return;
    }

    const selections = validateBeforeStart();
    if (!selections) {
        updateSetsElements();
        return;
    }

    mygame.fixture.hometeam_name = selections.homeName;
    mygame.fixture.awayteam_name = selections.awayName;
    mygame.teamA = selections.leftStarter;
    mygame.onLeft = true;
    mygame.team_serving_startset = selections.firstServer;

    setupState.matchStarted = true;
    lockPrematchSetup();
    elements.setupPanel.classList.add('hidden');

    setSetupFeedback('Match started. Toss choices are locked. Rules remain available for viewing.', 'success');
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

    setSetupFeedback('Decider toss applied.', 'success');
    updateSetsElements();
}

function completeCurrentSet() {
    mygame.completeSet();
    updateSetsElements();
}

function interruptGame() {
    const shouldInterrupt = window.confirm('Interrupt this game before match completion?');
    if (!shouldInterrupt) {
        return;
    }

    mygame.completeGame();
    mygame.interruptReason = window.prompt('Please enter an interruption reason (optional):') || 'No reason provided';
    updateSetsElements();
}

function hookEventListeners() {
    elements.toggleSetupPanel.addEventListener('click', () => {
        elements.setupPanel.classList.toggle('hidden');
        elements.rulesPanel.classList.add('hidden');
    });

    elements.toggleRulesPanel.addEventListener('click', () => {
        elements.rulesPanel.classList.toggle('hidden');
        elements.setupPanel.classList.add('hidden');
    });

    elements.rulesProfile.addEventListener('change', handleRulesProfileChange);
    elements.applyRulesProfile.addEventListener('click', applySelectedRulesProfile);
    elements.saveCustomRules.addEventListener('click', saveCustomRules);
    elements.saveRulesProfile.addEventListener('click', saveCurrentRulesAsNewProfile);
    elements.deleteRulesProfile.addEventListener('click', deleteSelectedSavedProfile);

    elements.startMatch.addEventListener('click', startMatch);
    elements.applyDeciderToss.addEventListener('click', applyDeciderToss);

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
        elements.minliberoifthirteen
    ]) {
        input.addEventListener('change', markRulesDirty);
    }

    for (const input of [elements.homeTeamName, elements.awayTeamName]) {
        input.addEventListener('input', () => {
            updateSetupBadge();
            updateActionAvailability();
        });
    }

    for (const radio of document.querySelectorAll('input[name="setup-left-starter"], input[name="setup-first-server"]')) {
        radio.addEventListener('change', () => {
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
    elements.setupPanel.classList.add('hidden');
    elements.rulesPanel.classList.add('hidden');

    elements.homeTeamName.value = mygame.fixture.hometeam_name;
    elements.awayTeamName.value = mygame.fixture.awayteam_name;

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
    updateRulesPanelView();

    setSetupFeedback('Open Rules to apply a preset or save custom rules, then complete toss choices.', '');
    setRulesFeedback('Select or load a profile and click Apply Profile, or choose Custom and save.', '');
}

function init() {
    initDarkMode();
    initSetupDefaults();
    hookEventListeners();
    updateSetsElements();
}

init();
