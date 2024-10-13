import Fixture from './Fixture.js';
import Rules from './Rules.js';
import Game from './Game.js';
import LineupDev from './LineupDev.js';
import getSymbolsFromSetterPosition from './utils.js';




var max_court_width = 0.8 * Math.min(window.innerWidth,window.innerHeight)

//max_court_width = window.innerWidth;

function get_window_width() {
    return Math.min(max_court_width,600); // 0.80 * max_court_width ;
}

function get_window_height() {
    return Math.min(max_court_width,600); // 0.80 * max_court_width ;
}

var window_width = get_window_width() ;
//window_height = 0.80 * 2 * max_court_width;
var window_height = get_window_height();


let canvasleft = document.getElementById("canvasleft");
let contextleft = canvasleft.getContext("2d");

canvasleft.width = window_width;
canvasleft.height = window_height;

canvasleft.style.background = "#FFFFFF";

contextleft.clearRect(0, 0, window_width , window_height)

var mysymbols = getSymbolsFromSetterPosition(1);

var mylineupteamA_id = "teamAlineup"

var mylineupteamA = new LineupDev(
    mylineupteamA_id,
    [5,9,45,23,12,7],
    mysymbols,
    contextleft, 
    0, 
    true,
    window_width,
    window_height);
mylineupteamA.team = "teamA";
mylineupteamA.addShirtnum(4);
mylineupteamA.addShirtnum(10);
var mylineup = mylineupteamA;
mylineup.loadState(mylineupteamA_id)
mylineup.draw();





let canvasright = document.getElementById("canvasright");
let contextright = canvasright.getContext("2d");

canvasright.width = window_width;
canvasright.height = window_height;

canvasright.style.background = "#FFFFFF";

contextright.clearRect(0, 0, window_width , window_height)
//contextright.fillStyle = 'blue';
//contextright.fillRect(0, 0, canvasright.width, canvasright.height);

var mylineupteamB_id = "teamBlineup"

var mylineupteamB = new LineupDev(
    mylineupteamB_id,
    [3,10,8,7,13,4],
    mysymbols,
    contextright, 
    0, 
    false,
    window_width,
    window_height
    );
mylineupteamB.team = "teamB"
var mylineupright = mylineupteamB;
mylineupright.loadState(mylineupteamB_id)
mylineupright.draw();

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

const lineupeditmodedropdown = document.getElementById('lineupeditmode-dropdown');

lineupeditmodedropdown.addEventListener('change',function(){

    const selectedMode = this.value; // Get the selected editmode from dropdown
    mylineup.editmode = selectedMode; // Set the editmode in the Lineup instance
    mylineupright.editmode = selectedMode; // Set the editmode in the Lineup instance

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

// Call this function on window resize or when the canvas is rendered
function adjustCanvasSize(canvasid, reason,thelineup) {
    var canvas = document.getElementById(canvasid);
    var styleWidth = canvas.getBoundingClientRect().width;
    var styleHeight = canvas.getBoundingClientRect().height;

    // Update the canvas internal size to match the visual size
    canvas.width = styleWidth;
    canvas.height = styleHeight;

    // Redraw your canvas content after resizing if necessary
    thelineup.refreshPositions()
    thelineup.draw(reason);
    
}
/* window.addEventListener('resize', 
function(){
    console.log("RESIZE EVENT FOR LEFT CANVAS")
    adjustCanvasSize("canvasleft", "RESIZE EVENT",mylineup);
    adjustCanvasSize("canvasright","RESIZE EVENT",mylineupright);
}
);
window.addEventListener('load', 
function(){
    adjustCanvasSize("canvasleft", "LOAD EVENT",mylineup);
    adjustCanvasSize("canvasright","LOAD EVENT",mylineupright);
}
); */



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









