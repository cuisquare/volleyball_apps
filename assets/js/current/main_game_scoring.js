import Fixture from '../core/Fixture.js';
import Rules from '../core/Rules.js';
import Game from '../core/Game.js';

const DEFAULT_RULES = {
    regsetpts: 21,
    nbsetswin: 2,
    decidersetpts: 15,
    ptsdiffwinpts: 2,
    ptsdiffwinset: 2,
    swapsidesindecider: true,
    nbptsforswap: 8,
    maxnumberplayers: 14,
    minliberoifthirteen: 2
};

const myfixture = new Fixture(
    '45',
    'Chestnut Grove Academy',
    new Date('2025-02-02T16:00:00'),
    '16:20',
    '18:00',
    'Home team',
    'Away team',
    new Rules(
        DEFAULT_RULES.regsetpts,
        DEFAULT_RULES.nbsetswin,
        DEFAULT_RULES.decidersetpts,
        DEFAULT_RULES.ptsdiffwinpts,
        DEFAULT_RULES.ptsdiffwinset,
        DEFAULT_RULES.swapsidesindecider,
        DEFAULT_RULES.nbptsforswap,
        DEFAULT_RULES.maxnumberplayers,
        DEFAULT_RULES.minliberoifthirteen
    )
);

const mygame = new Game(myfixture);

const setupState = {
    rulesConfirmed: false,
    rulesSource: 'none',
    matchStarted: false,
    setupLocked: false,
    deciderPromptShown: false
};

const elements = {
    setupPanel: document.getElementById('setup-panel'),
    toggleSetupPanel: document.getElementById('toggle-setup-panel'),
    setupStatusBadge: document.getElementById('setup-status-badge'),
    setupFeedback: document.getElementById('setup-feedback'),
    startMatch: document.getElementById('start-match'),
    saveCustomRules: document.getElementById('save-custom-rules'),
    acceptDefaultRules: document.getElementById('accept-default-rules'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    completeSet: document.getElementById('completeSet'),
    completeGame: document.getElementById('completeGame'),
    undoLastPoint: document.getElementById('undo-last-point'),
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

function setFeedback(message, variant = '') {
    elements.setupFeedback.textContent = message;
    elements.setupFeedback.classList.remove('error', 'success');
    if (variant) {
        elements.setupFeedback.classList.add(variant);
    }
}

function asPositiveInteger(value, fieldName, minValue = 1) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < minValue) {
        throw new Error(`${fieldName} must be an integer >= ${minValue}.`);
    }
    return parsed;
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
    const parsed = {
        regsetpts: asPositiveInteger(elements.regsetpts.value, 'Regular set points'),
        nbsetswin: asPositiveInteger(elements.nbsetswin.value, 'Sets to win', 1),
        decidersetpts: asPositiveInteger(elements.decidersetpts.value, 'Decider set points'),
        ptsdiffwinpts: asPositiveInteger(elements.ptsdiffwinpts.value, 'Points diff for interrupted match', 0),
        ptsdiffwinset: asPositiveInteger(elements.ptsdiffwinset.value, 'Points diff to win set'),
        swapsidesindecider: elements.swapsidesindecider.checked,
        nbptsforswap: asPositiveInteger(elements.nbptsforswap.value, 'Points for side swap'),
        maxnumberplayers: asPositiveInteger(elements.maxnumberplayers.value, 'Max players'),
        minliberoifthirteen: asPositiveInteger(elements.minliberoifthirteen.value, 'Min liberos if 13 players', 0)
    };

    if (parsed.nbptsforswap > parsed.decidersetpts) {
        throw new Error('Points for side swap cannot be greater than decider set points.');
    }

    return parsed;
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

function markRulesDirty() {
    if (!setupState.matchStarted && setupState.rulesConfirmed) {
        setupState.rulesConfirmed = false;
        setupState.rulesSource = 'none';
        setFeedback('Rules changed. Save custom rules or explicitly accept defaults before starting.', 'error');
    }
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
        setFeedback('Rules are required. Save custom rules or use defaults explicitly.', 'error');
        return null;
    }

    const selections = getSetupSelections();
    if (!selections.homeName) {
        setFeedback('Home team name is required.', 'error');
        return null;
    }
    if (!selections.awayName) {
        setFeedback('Away team name is required.', 'error');
        return null;
    }
    if (!selections.leftStarter) {
        setFeedback('Select whether home or away starts on the left side.', 'error');
        return null;
    }
    if (!selections.firstServer) {
        setFeedback('Select which team serves first.', 'error');
        return null;
    }

    return selections;
}

function lockPrematchSetup() {
    setupState.setupLocked = true;
    elements.startMatch.disabled = true;
    elements.saveCustomRules.disabled = true;
    elements.acceptDefaultRules.disabled = true;

    const prematchInputs = [
        elements.homeTeamName,
        elements.awayTeamName,
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
}

function updateSetupBadge() {
    elements.setupStatusBadge.classList.remove('ready', 'locked');
    const deciderTossRequired = setupState.matchStarted && mygame.isPreDeciderToss && !mygame.isGameOver;

    if (deciderTossRequired) {
        elements.setupStatusBadge.textContent = 'Decider Toss Required';
        elements.setupStatusBadge.classList.add('locked');
        return;
    }

    if (setupState.matchStarted) {
        elements.setupStatusBadge.textContent = 'Setup Locked';
        elements.setupStatusBadge.classList.add('locked');
        return;
    }

    if (hasReadySelections()) {
        elements.setupStatusBadge.textContent = `Ready (${setupState.rulesSource === 'default' ? 'Defaults' : 'Custom Rules'})`;
        elements.setupStatusBadge.classList.add('ready');
        return;
    }

    if (setupState.rulesConfirmed) {
        elements.setupStatusBadge.textContent = 'Rules Confirmed, Setup Pending';
        return;
    }

    elements.setupStatusBadge.textContent = 'Setup Incomplete';
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
        elements.gameStatus.textContent = 'Setup required before match start.';
    } else {
        elements.gameStatus.textContent = mygame.getGameStatus();
    }
}

function updateDeciderTossVisibility() {
    const deciderTossRequired = setupState.matchStarted && mygame.isPreDeciderToss && !mygame.isGameOver;

    if (deciderTossRequired) {
        elements.deciderCard.classList.add('visible');
        elements.toggleSetupPanel.classList.add('needs-attention');
        elements.setupStatusBadge.classList.add('needs-attention');
        elements.setupPanel.classList.remove('hidden');
        if (!setupState.deciderPromptShown) {
            setFeedback('Decider set reached: please complete decider toss in setup.', 'error');
            setupState.deciderPromptShown = true;
        }
        return;
    }

    elements.deciderCard.classList.remove('visible');
    elements.toggleSetupPanel.classList.remove('needs-attention');
    elements.setupStatusBadge.classList.remove('needs-attention');
    setupState.deciderPromptShown = false;
}

function updateActionAvailability() {
    elements.startMatch.disabled = setupState.matchStarted || !hasReadySelections();

    const canManageSet = setupState.matchStarted && !mygame.isGameOver;
    const canScore = canManageSet && mygame.team_serving_currently !== 'Unknown';
    const canUndo = canManageSet && mygame.pointHistory.length > 0;

    elements.incTeamA.disabled = !canScore;
    elements.incTeamB.disabled = !canScore;
    elements.undoLastPoint.disabled = !canUndo;
    elements.completeSet.disabled = !canManageSet;
    elements.completeGame.disabled = !canManageSet;
    elements.applyDeciderToss.disabled = !(setupState.matchStarted && mygame.isPreDeciderToss && !mygame.isGameOver);
}

function updateSetsElements() {
    updateTeamPosition();
    updateScoringServingValues();
    updateDeciderTossVisibility();
    updateSetupBadge();
    updateActionAvailability();
}

function acceptDefaultRules() {
    if (setupState.matchStarted) {
        return;
    }

    setRulesFormValues(DEFAULT_RULES);
    applyRules(DEFAULT_RULES);
    setupState.rulesConfirmed = true;
    setupState.rulesSource = 'default';
    setFeedback('Default rules accepted explicitly.', 'success');
    updateSetsElements();
}

function saveCustomRules() {
    if (setupState.matchStarted) {
        return;
    }

    try {
        const customRules = getRulesFromForm();
        applyRules(customRules);
        setupState.rulesConfirmed = true;
        setupState.rulesSource = 'custom';
        setFeedback('Custom rules saved and confirmed.', 'success');
        updateSetsElements();
    } catch (error) {
        setFeedback(error.message, 'error');
    }
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
    // Team A is always the team that started left in set 1.
    mygame.teamA = selections.leftStarter;
    mygame.onLeft = true;
    mygame.team_serving_startset = selections.firstServer;

    setupState.matchStarted = true;
    lockPrematchSetup();
    elements.setupPanel.classList.add('hidden');

    setFeedback('Match started. Pre-match setup is now locked.', 'success');
    updateSetsElements();
}

function applyDeciderToss() {
    if (!setupState.matchStarted || !mygame.isPreDeciderToss) {
        return;
    }

    const leftTeam = elements.deciderLeftTeam.value;
    const servingTeam = elements.deciderServingTeam.value;

    if (!leftTeam || !servingTeam) {
        setFeedback('Select both decider left-side team and first server.', 'error');
        return;
    }

    mygame.onLeft = leftTeam === 'teamA';
    mygame.team_serving_deciderset = servingTeam;

    setFeedback('Decider toss applied.', 'success');
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
    });

    elements.saveCustomRules.addEventListener('click', saveCustomRules);
    elements.acceptDefaultRules.addEventListener('click', acceptDefaultRules);
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
    setRulesFormValues(DEFAULT_RULES);
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

    setFeedback('Choose rule confirmation and review pre-match setup.', '');
}

function init() {
    initDarkMode();
    initSetupDefaults();
    hookEventListeners();
    updateSetsElements();
}

init();
