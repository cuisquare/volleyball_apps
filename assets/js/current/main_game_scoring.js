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
    activePanel: 'rules'
};

const elements = {
    scoreboardPanel: document.getElementById('scoreboard-panel'),
    teamDetailsPanel: document.getElementById('team-details-panel'),
    setupPanel: document.getElementById('setup-panel'),
    rulesPanel: document.getElementById('rules-panel'),
    toggleScoreboardPanel: document.getElementById('toggle-scoreboard-panel'),
    toggleTeamDetailsPanel: document.getElementById('toggle-team-details-panel'),
    toggleSetupPanel: document.getElementById('toggle-setup-panel'),
    toggleRulesPanel: document.getElementById('toggle-rules-panel'),
    setupStatusBadge: document.getElementById('setup-status-badge'),
    rulesStatusBadge: document.getElementById('rules-status-badge'),
    setupFeedback: document.getElementById('setup-feedback'),
    rulesFeedback: document.getElementById('rules-feedback'),
    teamDetailsFeedback: document.getElementById('team-details-feedback'),
    applyTeamDetails: document.getElementById('apply-team-details'),
    rosterRulesHint: document.getElementById('roster-rules-hint'),
    homePlayerName: document.getElementById('home-player-name'),
    homePlayerNumber: document.getElementById('home-player-number'),
    homePlayerRegNumber: document.getElementById('home-player-reg-number'),
    homePlayerLibero: document.getElementById('home-player-libero'),
    addHomePlayer: document.getElementById('add-home-player'),
    homeRosterCount: document.getElementById('home-roster-count'),
    homeRosterBody: document.getElementById('home-roster-body'),
    awayPlayerName: document.getElementById('away-player-name'),
    awayPlayerNumber: document.getElementById('away-player-number'),
    awayPlayerRegNumber: document.getElementById('away-player-reg-number'),
    awayPlayerLibero: document.getElementById('away-player-libero'),
    addAwayPlayer: document.getElementById('add-away-player'),
    awayRosterCount: document.getElementById('away-roster-count'),
    awayRosterBody: document.getElementById('away-roster-body'),
    applyPrematchToss: document.getElementById('apply-prematch-toss'),
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

function setActivePanel(panelName) {
    setupState.activePanel = panelName;

    elements.scoreboardPanel.classList.toggle('hidden', panelName !== 'scoreboard');
    elements.teamDetailsPanel.classList.toggle('hidden', panelName !== 'teamDetails');
    elements.setupPanel.classList.toggle('hidden', panelName !== 'setup');
    elements.rulesPanel.classList.toggle('hidden', panelName !== 'rules');

    elements.toggleScoreboardPanel.classList.toggle('active-tab', panelName === 'scoreboard');
    elements.toggleTeamDetailsPanel.classList.toggle('active-tab', panelName === 'teamDetails');
    elements.toggleSetupPanel.classList.toggle('active-tab', panelName === 'setup');
    elements.toggleRulesPanel.classList.toggle('active-tab', panelName === 'rules');
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
}

function updateRosterRuleHint() {
    const maxPlayers = getMaxRosterPlayers();
    const minLiberos = getMinLiberosIfThirteen();
    const maxLiberos = getMaxLiberosPerRoster();
    elements.rosterRulesHint.textContent = `Roster limits: up to ${maxPlayers} players per team, max ${maxLiberos} liberos, and at least 6 non-libero players. If roster has exactly 13 players, at least ${minLiberos} libero(s) are required.`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getRosterInputs(teamSide) {
    if (teamSide === 'home') {
        return {
            nameInput: elements.homePlayerName,
            numberInput: elements.homePlayerNumber,
            regInput: elements.homePlayerRegNumber,
            liberoInput: elements.homePlayerLibero,
            addButton: elements.addHomePlayer,
            body: elements.homeRosterBody,
            count: elements.homeRosterCount
        };
    }

    return {
        nameInput: elements.awayPlayerName,
        numberInput: elements.awayPlayerNumber,
        regInput: elements.awayPlayerRegNumber,
        liberoInput: elements.awayPlayerLibero,
        addButton: elements.addAwayPlayer,
        body: elements.awayRosterBody,
        count: elements.awayRosterCount
    };
}

function renderRoster(teamSide) {
    const roster = setupState.rosters[teamSide];
    const controls = getRosterInputs(teamSide);
    controls.body.innerHTML = '';

    const maxPlayers = getMaxRosterPlayers();
    controls.count.textContent = `${roster.length} / ${maxPlayers} players`;

    if (roster.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td class="roster-empty" colspan="5">No players added yet.</td>';
        controls.body.appendChild(emptyRow);
        return;
    }

    for (const player of roster) {
        const canRemove = !setupState.matchStarted;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(player.name)}</td>
            <td>${player.shirtNumber}</td>
            <td>${player.isLibero ? 'Yes' : 'No'}</td>
            <td>${player.regNumber ? escapeHtml(player.regNumber) : '-'}</td>
            <td>
                <button class="table-action-btn edit-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Edit</button>
                <button class="table-action-btn remove-player-btn" data-team="${teamSide}" data-player-id="${player.id}" type="button" ${canRemove ? '' : 'disabled'}>Remove</button>
            </td>
        `;
        controls.body.appendChild(row);
    }

    const isEditing = Boolean(setupState.editingRosterPlayerId[teamSide]);
    controls.addButton.textContent = isEditing
        ? (teamSide === 'home' ? 'Save Home Player' : 'Save Away Player')
        : (teamSide === 'home' ? 'Add Home Player' : 'Add Away Player');
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
            isLibero: false
        });
    }
    return roster;
}

function validateRosterForTeam(teamSide, roster) {
    if (roster.length < 6) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least 6 players.`);
    }

    const maxPlayers = getMaxRosterPlayers();
    if (roster.length > maxPlayers) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot exceed ${maxPlayers} players.`);
    }

    const numbers = new Set();
    for (const player of roster) {
        if (numbers.has(player.shirtNumber)) {
            return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster has duplicate shirt number ${player.shirtNumber}.`);
        }
        numbers.add(player.shirtNumber);
    }

    const liberos = roster.filter((player) => player.isLibero).length;
    const maxLiberos = getMaxLiberosPerRoster();
    if (liberos > maxLiberos) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot have more than ${maxLiberos} liberos.`);
    }

    const nonLiberos = roster.length - liberos;
    if (nonLiberos < 6) {
        return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least 6 non-libero players.`);
    }

    if (roster.length === 13) {
        const minLiberos = getMinLiberosIfThirteen();
        if (liberos < minLiberos) {
            return withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least ${minLiberos} libero(s) when 13 players are listed.`);
        }
    }

    return '';
}

function clearRosterInputs(teamSide) {
    const controls = getRosterInputs(teamSide);
    controls.nameInput.value = '';
    controls.numberInput.value = '';
    controls.regInput.value = '';
    controls.liberoInput.checked = false;
    setupState.editingRosterPlayerId[teamSide] = '';
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

    if (!editingId && roster.length >= getMaxRosterPlayers()) {
        setTeamDetailsFeedback(withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster is at max size for current rules.`), 'error');
        return;
    }

    const name = controls.nameInput.value.trim();
    const shirtNumber = Number.parseInt(controls.numberInput.value, 10);
    const regNumber = controls.regInput.value.trim();
    const isLibero = controls.liberoInput.checked;

    if (!name) {
        setTeamDetailsFeedback('Player name is required.', 'error');
        return;
    }
    if (!Number.isInteger(shirtNumber) || shirtNumber <= 0) {
        setTeamDetailsFeedback('Shirt number must be a positive integer.', 'error');
        return;
    }
    const duplicateNumber = roster.some((player) => player.shirtNumber === shirtNumber && player.id !== editingId);
    if (duplicateNumber) {
        setTeamDetailsFeedback(`Shirt number ${shirtNumber} is already used in ${teamSide} roster.`, 'error');
        return;
    }

    const rosterForValidation = editingId
        ? roster.map((player) => (player.id === editingId
            ? {
                ...player,
                name,
                shirtNumber,
                regNumber,
                isLibero
            }
            : player))
        : [...roster, {
            id: `p_${setupState.nextRosterPlayerId}`,
            name,
            shirtNumber,
            regNumber,
            isLibero
        }];

    const currentLiberos = roster.filter((player) => player.isLibero).length;
    const existingEditedPlayer = editingId ? roster.find((player) => player.id === editingId) : null;
    const baselineLiberos = existingEditedPlayer && existingEditedPlayer.isLibero ? currentLiberos - 1 : currentLiberos;
    const nextRosterSize = rosterForValidation.length;
    const nextLiberos = baselineLiberos + (isLibero ? 1 : 0);
    const minLiberosIfThirteen = getMinLiberosIfThirteen();

    if (!editingId && nextRosterSize === 13 && nextLiberos < minLiberosIfThirteen) {
        if (!isLibero) {
            setTeamDetailsFeedback(withRulesContext(`Cannot add a 13th non-libero player: ${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least ${minLiberosIfThirteen} libero(s) at 13 players.`), 'error');
        } else {
            setTeamDetailsFeedback(withRulesContext(`At 13 players, ${teamSide === 'home' ? 'Home' : 'Away'} roster needs at least ${minLiberosIfThirteen} libero(s). Add another libero before reaching 13 players.`), 'error');
        }
        return;
    }

    if (isLibero) {
        const maxLiberos = getMaxLiberosPerRoster();
        if (baselineLiberos >= maxLiberos) {
            setTeamDetailsFeedback(withRulesContext(`${teamSide === 'home' ? 'Home' : 'Away'} roster cannot have more than ${maxLiberos} liberos.`), 'error');
            return;
        }
    }

    const rosterValidationError = validateRosterForTeam(teamSide, rosterForValidation);
    if (rosterValidationError) {
        setTeamDetailsFeedback(rosterValidationError, 'error');
        return;
    }

    if (editingId) {
        setupState.rosters[teamSide] = rosterForValidation;
    } else {
        roster.push({
            id: `p_${setupState.nextRosterPlayerId++}`,
            name,
            shirtNumber,
            regNumber,
            isLibero
        });
    }

    markTeamDetailsDirty();
    renderRosters();
    clearRosterInputs(teamSide);
    setTeamDetailsFeedback(
        `${teamSide === 'home' ? 'Home' : 'Away'} player ${editingId ? 'updated' : 'added'}. Click Apply Team Details when ready.`,
        ''
    );
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
    controls.numberInput.value = player.shirtNumber;
    controls.regInput.value = player.regNumber || '';
    controls.liberoInput.checked = Boolean(player.isLibero);

    setupState.editingRosterPlayerId[teamSide] = playerId;
    renderRoster(teamSide);
    setTeamDetailsFeedback(`${teamSide === 'home' ? 'Home' : 'Away'} player loaded for edit. Update fields and click Save.`, '');
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
        elements.minliberoifthirteen
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
    return setupState.rulesConfirmed && setupState.teamDetailsConfirmed && setupState.prematchTossConfirmed;
}

function validateBeforeStart() {
    if (!setupState.rulesConfirmed) {
        setSetupFeedback('Rules are required. Apply a preset or save custom rules first.', 'error');
        return null;
    }
    if (!setupState.teamDetailsConfirmed) {
        setSetupFeedback('Apply team details and rosters before starting the match.', 'error');
        return null;
    }

    if (!setupState.prematchTossConfirmed) {
        setSetupFeedback('Apply prematch toss choices before starting the match.', 'error');
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

    for (const input of [
        elements.homePlayerName,
        elements.homePlayerNumber,
        elements.homePlayerRegNumber,
        elements.homePlayerLibero,
        elements.awayPlayerName,
        elements.awayPlayerNumber,
        elements.awayPlayerRegNumber,
        elements.awayPlayerLibero
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
    renderRosters();
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

function updateActionAvailability() {
    elements.startMatch.disabled = setupState.matchStarted || !hasReadySelections();
    elements.applyTeamDetails.disabled = setupState.matchStarted || !setupState.rulesConfirmed;
    elements.applyPrematchToss.disabled = setupState.matchStarted || !setupState.rulesConfirmed || !setupState.teamDetailsConfirmed;
    elements.addHomePlayer.disabled = setupState.matchStarted || !setupState.rulesConfirmed || setupState.rosters.home.length >= getMaxRosterPlayers();
    elements.addAwayPlayer.disabled = setupState.matchStarted || !setupState.rulesConfirmed || setupState.rosters.away.length >= getMaxRosterPlayers();

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
    updateRosterRuleHint();
    renderRosters();
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
    setupState.teamDetailsConfirmed = false;
    setupState.prematchTossConfirmed = false;

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

    setupState.matchStarted = true;
    lockPrematchSetup();
    setActivePanel('scoreboard');

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

    setupState.prematchTossConfirmed = true;
    setSetupFeedback('Prematch toss choices applied. You can now start the match.', 'success');
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

    setTeamDetailsFeedback('Team details and rosters applied. Continue to prematch toss choices.', 'success');
    setSetupFeedback('Team details and rosters applied. Complete prematch toss choices next.', '');
    setActivePanel('setup');
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
    elements.toggleScoreboardPanel.addEventListener('click', () => setActivePanel('scoreboard'));
    elements.toggleTeamDetailsPanel.addEventListener('click', () => setActivePanel('teamDetails'));
    elements.toggleSetupPanel.addEventListener('click', () => setActivePanel('setup'));
    elements.toggleRulesPanel.addEventListener('click', () => setActivePanel('rules'));

    elements.rulesProfile.addEventListener('change', handleRulesProfileChange);
    elements.applyRulesProfile.addEventListener('click', applySelectedRulesProfile);
    elements.saveCustomRules.addEventListener('click', saveCustomRules);
    elements.saveRulesProfile.addEventListener('click', saveCurrentRulesAsNewProfile);
    elements.deleteRulesProfile.addEventListener('click', deleteSelectedSavedProfile);

    elements.addHomePlayer.addEventListener('click', () => addRosterPlayer('home'));
    elements.addAwayPlayer.addEventListener('click', () => addRosterPlayer('away'));
    elements.homeRosterBody.addEventListener('click', (event) => {
        const button = event.target.closest('.remove-player-btn, .edit-player-btn');
        if (!button) {
            return;
        }
        if (button.classList.contains('edit-player-btn')) {
            editRosterPlayer(button.dataset.team, button.dataset.playerId);
            return;
        }
        removeRosterPlayer(button.dataset.team, button.dataset.playerId);
    });
    elements.awayRosterBody.addEventListener('click', (event) => {
        const button = event.target.closest('.remove-player-btn, .edit-player-btn');
        if (!button) {
            return;
        }
        if (button.classList.contains('edit-player-btn')) {
            editRosterPlayer(button.dataset.team, button.dataset.playerId);
            return;
        }
        removeRosterPlayer(button.dataset.team, button.dataset.playerId);
    });

    elements.applyTeamDetails.addEventListener('click', applyTeamDetails);
    elements.applyPrematchToss.addEventListener('click', applyPrematchTossChoices);
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
    setupState.rosters.home = Array.isArray(mygame.fixture.home_roster) ? mygame.fixture.home_roster.map((player) => ({ ...player })) : [];
    setupState.rosters.away = Array.isArray(mygame.fixture.away_roster) ? mygame.fixture.away_roster.map((player) => ({ ...player })) : [];
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
    updateRosterRuleHint();
    renderRosters();

    setSetupFeedback('After rules are confirmed, complete Team Details and rosters, then toss choices to start match.', '');
    setTeamDetailsFeedback('Enter both team names, build both rosters, then click Apply Team Details.', '');
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
