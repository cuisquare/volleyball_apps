import Fixture from '../core/Fixture.js';
import Rules from '../core/Rules.js';
import Game from '../core/Game.js';
import Lineup from './Lineup.js';
import getSymbolsFromSetterPosition from '../core/utils.js';

function getMaxCourtWidth() {
    return Math.min(0.8 * Math.min(window.innerWidth, window.innerHeight), 600);
}

function get_window_width() {
    return getMaxCourtWidth();
}

function get_window_height() {
    return getMaxCourtWidth();
}

var window_width = get_window_width() ;
var window_height = get_window_height();


let canvasleft = document.getElementById("canvasleft");
let contextleft = canvasleft.getContext("2d");

canvasleft.width = window_width;
canvasleft.height = window_height;

canvasleft.style.background = "#FFFFFF";

contextleft.clearRect(0, 0, window_width , window_height)

var mysymbols = getSymbolsFromSetterPosition(1);

function parseShirtNumbersInput(rawValue) {
    const tokens = rawValue
        .split(/[\s,]+/)
        .map(token => token.trim())
        .filter(Boolean);

    if (tokens.length === 0) {
        return { ok: false, error: "Enter at least one shirt number." };
    }

    const numbers = tokens.map(token => Number(token));
    const hasInvalidNumber = numbers.some(number => !Number.isInteger(number) || number < 1 || number > 99);
    if (hasInvalidNumber) {
        return { ok: false, error: "Use whole shirt numbers between 1 and 99." };
    }

    if (new Set(numbers).size !== numbers.length) {
        return { ok: false, error: "Shirt numbers must be unique." };
    }

    return { ok: true, values: numbers };
}

function setStatusMessage(statusElement, message, status = "") {
    statusElement.textContent = message;
    statusElement.className = "setup-status";
    if (status) {
        statusElement.classList.add(status);
    }
}

function redrawLineup(lineup, reason = "UI update") {
    lineup.checkPositionsLegalityStatic();
    lineup.draw(reason);
}

function syncCanvasDisplaySize(canvas) {
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const sizeChanged = canvas.width !== nextWidth || canvas.height !== nextHeight;

    if (sizeChanged) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
    }

    return sizeChanged;
}

const teamSetupControllers = [];

function refreshAllTeamSetupPanels() {
    teamSetupControllers.forEach(controller => controller.render());
}

function getTeamDisplayName(lineup) {
    return lineup.team === "teamB" ? "Team B" : "Team A";
}

function isNarrowSetupLayout() {
    return window.innerWidth <= 750;
}

function getLineupSlotOrder(lineup) {
    if (isNarrowSetupLayout()) {
        return [1, 2, 3, 4, 5, 6];
    }

    if (lineup.isUpright) {
        // Wide upright layout is listed in visual row order, left-to-right then top-to-bottom.
        return [4, 3, 2, 5, 6, 1];
    }

    if (lineup.leftcourt) {
        // Sideways layouts are also listed in visual row order rather than column-by-column.
        return [5, 4, 6, 3, 1, 2];
    }

    // Right court sideways layout in visual row order.
    return [2, 1, 3, 6, 4, 5];
}

function getSelectableShirtNumsForPosition(lineup, currentShirt) {
    if (lineup.editmode === "ingame") {
        const benchShirts = lineup.fullshirtnums.filter(shirt => !lineup.shirtnums.includes(shirt));
        return [currentShirt, ...benchShirts];
    }

    if (lineup.editmode === "freeswap") {
        return lineup.fullshirtnums.slice();
    }

    return lineup.fullshirtnums.slice();
}

function bindTeamSetup(teamKey, sideLabel, lineup) {
    let currentLineup = lineup;
    const titleElement = document.getElementById(`${teamKey}-setup-title`);
    const lineupGrid = document.getElementById(`${teamKey}-lineup-grid`);
    const rosterInput = document.getElementById(`${teamKey}-roster-input`);
    const rosterApplyButton = document.getElementById(`${teamKey}-roster-apply`);
    const lineupApplyButton = document.getElementById(`${teamKey}-lineup-apply`);
    const statusElement = document.getElementById(`${teamKey}-setup-status`);
    const lineupSlots = Array.from({ length: 6 }, (_, index) =>
        document.getElementById(`${teamKey}-slot-${index + 1}`)
    );
    const lineupInputs = Array.from({ length: 6 }, (_, index) =>
        document.getElementById(`${teamKey}-lineup-${index + 1}`)
    );

    function applyRosterUpdate() {
        const lineup = currentLineup;
        const parsedRoster = parseShirtNumbersInput(rosterInput.value);
        if (!parsedRoster.ok) {
            setStatusMessage(statusElement, parsedRoster.error, "error");
            return;
        }

        if (parsedRoster.values.length < 6) {
            setStatusMessage(statusElement, "Roster must contain at least six shirt numbers.", "error");
            return;
        }

        const lineupNotInRoster = lineup.shirtnums.filter(shirt => !parsedRoster.values.includes(shirt));
        if (lineupNotInRoster.length > 0) {
            setStatusMessage(
                statusElement,
                `Roster must include the current lineup: ${lineupNotInRoster.join(", ")}.`,
                "error"
            );
            renderTeamSetup();
            return;
        }

        lineup.setFullShirtNums(parsedRoster.values);
        redrawLineup(lineup, "Roster update");
        renderTeamSetup();
        setStatusMessage(statusElement, "Roster updated.", "success");
    }

    function renderTeamSetup() {
        const lineup = currentLineup;
        const slotOrder = getLineupSlotOrder(lineup);
        titleElement.textContent = `${sideLabel}: ${getTeamDisplayName(lineup)}`;
        lineupGrid.classList.toggle("sideways-layout", !isNarrowSetupLayout() && !lineup.isUpright);
        slotOrder.forEach((positionNumber, orderIndex) => {
            lineupSlots[positionNumber - 1].style.order = String(orderIndex + 1);
        });
        rosterInput.value = lineup.fullshirtnums.join(", ");
        lineupInputs.forEach((input, index) => {
            const selectedShirt = lineup.shirtnums[index];
            input.replaceChildren();

            const selectableShirts = getSelectableShirtNumsForPosition(lineup, selectedShirt);

            selectableShirts.forEach(shirt => {
                const option = document.createElement("option");
                option.value = String(shirt);
                option.textContent = String(shirt);
                option.selected = shirt === selectedShirt;
                input.appendChild(option);
            });

            if (selectedShirt !== undefined && !selectableShirts.includes(selectedShirt)) {
                const fallbackOption = document.createElement("option");
                fallbackOption.value = String(selectedShirt);
                fallbackOption.textContent = String(selectedShirt);
                fallbackOption.selected = true;
                input.appendChild(fallbackOption);
            }
        });
    }

    rosterApplyButton.addEventListener("click", applyRosterUpdate);

    rosterInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            applyRosterUpdate();
        }
    });

    lineupApplyButton.addEventListener("click", function () {
        const lineup = currentLineup;
        const rawLineup = lineupInputs.map(input => input.value).join(",");
        const parsedLineup = parseShirtNumbersInput(rawLineup);

        if (!parsedLineup.ok) {
            setStatusMessage(statusElement, parsedLineup.error, "error");
            return;
        }

        if (parsedLineup.values.length !== 6) {
            setStatusMessage(statusElement, "Lineup must contain exactly six shirt numbers.", "error");
            return;
        }

        const shirtsOutsideRoster = parsedLineup.values.filter(shirt => !lineup.fullshirtnums.includes(shirt));
        if (shirtsOutsideRoster.length > 0) {
            setStatusMessage(
                statusElement,
                `Add these shirts to the roster first: ${shirtsOutsideRoster.join(", ")}.`,
                "error"
            );
            return;
        }

        lineup.setLineupShirtNums(parsedLineup.values);
        redrawLineup(lineup, "Lineup update");
        renderTeamSetup();
        setStatusMessage(statusElement, "Lineup updated.", "success");
    });

    lineupInputs.forEach((input, index) => {
        input.addEventListener("change", function () {
            const lineup = currentLineup;
            const selectedShirt = Number(input.value);
            const position = lineup.positions[index];

            if (!position || !Number.isInteger(selectedShirt)) {
                setStatusMessage(statusElement, "Unable to update this lineup position.", "error");
                renderTeamSetup();
                return;
            }

            const previousShirt = position.shirtnum;
            lineup.editShirtNum(position, selectedShirt, lineup.editmode);

            if (position.shirtnum === previousShirt && selectedShirt !== previousShirt) {
                setStatusMessage(
                    statusElement,
                    `Selection ${selectedShirt} is not allowed in ${lineup.editmode} mode.`,
                    "error"
                );
            } else {
                redrawLineup(lineup, "Dropdown lineup edit");
                setStatusMessage(
                    statusElement,
                    `Position ${index + 1} updated in ${lineup.editmode} mode.`,
                    "success"
                );
            }

            renderTeamSetup();
        });
    });

    renderTeamSetup();
    const controller = {
        render: renderTeamSetup,
        setLineup(newLineup) {
            currentLineup = newLineup;
            renderTeamSetup();
        }
    };
    teamSetupControllers.push(controller);
    return controller;
}

var mylineupteamA = new Lineup(
    [5,9,45,23,12,7],
    mysymbols,
    contextleft, 
    0, 
    true,
    window_width,
    window_height);
mylineupteamA.team = "teamA";
mylineupteamA.loadRotationSnapshots();
mylineupteamA.addShirtnum(4);
mylineupteamA.addShirtnum(10);
var mylineup = mylineupteamA;
redrawLineup(mylineup, "Initial draw");





let canvasright = document.getElementById("canvasright");
let contextright = canvasright.getContext("2d");

canvasright.width = window_width;
canvasright.height = window_height;

canvasright.style.background = "#FFFFFF";

contextright.clearRect(0, 0, window_width , window_height)
//contextright.fillStyle = 'blue';
//contextright.fillRect(0, 0, canvasright.width, canvasright.height);

var mylineupteamB = new Lineup(
    [3,10,8,7,13,4],
    mysymbols,
    contextright, 
    0, 
    false,
    window_width,
    window_height
    );
mylineupteamB.team = "teamB"
mylineupteamB.loadRotationSnapshots();
var mylineupright = mylineupteamB;
redrawLineup(mylineupright, "Initial draw");

const leftSetupController = bindTeamSetup("teamA", "Left Court", mylineup);
const rightSetupController = bindTeamSetup("teamB", "Right Court", mylineupright);

function updateSetupPanelAssignments() {
    leftSetupController.setLineup(mylineup);
    rightSetupController.setLineup(mylineupright);
}

mylineupteamA.setStateChangeHandler(refreshAllTeamSetupPanels);
mylineupteamB.setStateChangeHandler(refreshAllTeamSetupPanels);
refreshAllTeamSetupPanels();

document.getElementById('fwd').addEventListener('click',function(){
    //context.clearRect(0, 0, canvas.width, canvas.height)
    mylineup.rotateForward();
    mylineup.draw();
    //animate();
});

document.getElementById('bck').addEventListener('click',function(){
    //context.clearRect(0, 0, canvas.width, canvas.height)
    mylineup.rotateBackward();
    mylineup.draw();
    //animate();
    
});

document.getElementById('fwdright').addEventListener('click',function(){
    //context.clearRect(0, 0, canvas.width, canvas.height)
    mylineupright.rotateForward();
    mylineupright.draw();
    //animate();
});

document.getElementById('bckright').addEventListener('click',function(){
    //context.clearRect(0, 0, canvas.width, canvas.height)
    mylineupright.rotateBackward();
    mylineupright.draw();
    //animate();
    
});

//let rotate_angle = -Math.PI/ 2;
//var total_angle =0;

// Call the rotateCanvas function when needed
// For example, you can call it when a button is clicked
document.getElementById('changecourtsorientation').addEventListener('click', function() {
    mylineup.changeOrientationCanvas()
    mylineupright.changeOrientationCanvas()
    mylineup.draw();
    mylineupright.draw();
    refreshAllTeamSetupPanels();
});

document.getElementById('swapcourts').addEventListener('click', function() {

    var courtsUpright = mylineup.isUpright

    if (!courtsUpright) {
        mylineup.changeOrientationCanvas()
        mylineupright.changeOrientationCanvas()
    }

    var templineup = mylineup;
    mylineup = mylineupright;
    mylineupright = templineup;

    mylineup.assignContext(contextleft);
    mylineup.leftcourt = !mylineup.leftcourt;
    mylineupright.assignContext(contextright);
    mylineupright.leftcourt = !mylineupright.leftcourt;

    /* */
    
    mylineup.positions.forEach(pos => {
        pos.removeEventListeners();
    });
    mylineup.removeEventListeners();
    mylineup.positions.forEach(pos => {
        pos.addEventListeners();
    });
    mylineup.addEventListeners();

    
    mylineupright.positions.forEach(pos => {
        pos.removeEventListeners();
    });
    mylineupright.removeEventListeners();
    mylineupright.positions.forEach(pos => {
        pos.addEventListeners();
    });
    mylineupright.addEventListeners();



    if (!courtsUpright) {
        mylineup.changeOrientationCanvas()
        mylineupright.changeOrientationCanvas()
    }

    mylineup.draw();
    mylineupright.draw();
    updateSetupPanelAssignments();

});

const oldrulescheckbox = document.getElementById('oldrules-toggle-checkbox');
oldrulescheckbox.addEventListener('change',function(){

    if (this.checked) {
        mylineup.oldRules = true;
        mylineupright.oldRules = true;
        console.log("rules changed to old Rules")
    } else {
        mylineup.oldRules = false;
        mylineupright.oldRules = false;
        console.log("rules changed to new Rules")
    }

    mylineup.checkPositionsLegalityStatic();
    mylineup.draw();

    mylineupright.checkPositionsLegalityStatic();
    mylineupright.draw();
});

const persistentModeCheckbox = document.getElementById('persistentmode-toggle-checkbox');
const persistentModeStorageKey = 'positions_only_dev.persistentMode';
const savedPersistentMode = localStorage.getItem(persistentModeStorageKey);
const initialPersistentMode = savedPersistentMode === 'true';

persistentModeCheckbox.checked = initialPersistentMode;
mylineupteamA.persistentMode = initialPersistentMode;
mylineupteamB.persistentMode = initialPersistentMode;

if (initialPersistentMode) {
    mylineup.applyPersistentSnapshotIfAvailable();
    mylineupright.applyPersistentSnapshotIfAvailable();
    redrawLineup(mylineup, "Initial persistent layout");
    redrawLineup(mylineupright, "Initial persistent layout");
}

persistentModeCheckbox.addEventListener('change', function () {
    const persistentModeEnabled = this.checked;
    mylineupteamA.persistentMode = persistentModeEnabled;
    mylineupteamB.persistentMode = persistentModeEnabled;
    localStorage.setItem(persistentModeStorageKey, String(persistentModeEnabled));

    if (persistentModeEnabled) {
        mylineup.applyPersistentSnapshotIfAvailable();
        mylineupright.applyPersistentSnapshotIfAvailable();
        redrawLineup(mylineup, "Persistent mode enabled");
        redrawLineup(mylineupright, "Persistent mode enabled");
    }
});

const lineupeditmodedropdown = document.getElementById('lineupeditmode-dropdown');

lineupeditmodedropdown.addEventListener('change',function(){

    const selectedMode = this.value; // Get the selected editmode from dropdown
    mylineup.editmode = selectedMode; // Set the editmode in the Lineup instance
    mylineupright.editmode = selectedMode; // Set the editmode in the Lineup instance
    refreshAllTeamSetupPanels();

});

const playerappearancedropdown = document.getElementById('playerappearance-dropdown');
playerappearancedropdown.addEventListener('change',function(){

    const selectedMode = this.value; // Get the selected playerappearance from dropdown
    mylineup.playerappearance = selectedMode; // Set the playerappearance in the Lineup instance
    mylineupright.playerappearance= selectedMode; // Set the playerappearance in the Lineup instance
    mylineup.updatePlayerAppearance() 
    mylineup.draw();
    mylineupright.updatePlayerAppearance() 
    mylineupright.draw();
});

function resizeLineupCanvas(canvas, lineup, reason) {
    syncCanvasDisplaySize(canvas);
    lineup.refreshPositions(canvas.width, canvas.height);
    lineup.syncCanvasTransform();
    redrawLineup(lineup, reason);
}

function resizeAllCanvases(reason = "Resize event") {
    resizeLineupCanvas(canvasleft, mylineup, `${reason} left court`);
    resizeLineupCanvas(canvasright, mylineupright, `${reason} right court`);
    refreshAllTeamSetupPanels();
}

let resizeFrameId = null;
window.addEventListener("resize", function () {
    if (resizeFrameId !== null) {
        cancelAnimationFrame(resizeFrameId);
    }

    resizeFrameId = requestAnimationFrame(function () {
        resizeAllCanvases("Window resize");
        resizeFrameId = null;
    });
});

window.addEventListener("load", function () {
    resizeAllCanvases("Window load");
});



var game_id = "45"
/* venue
officialdate
officialstarttime
officialendtime
hometeam
awayteam */
const lvarules = new Rules()
const myfixture = new Fixture()
//const mygame = new Game();

