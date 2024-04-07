
import Lineup from './Lineup.js';
import getSymbolsFromSetterPosition from './utils.js';


let canvasleft = document.getElementById("canvasleft");
let contextleft = canvasleft.getContext("2d");

var max_court_width = Math.min(window.innerWidth,window.innerHeight)
var max_court_height = Math.min(window.innerWidth,window.innerHeight)

//max_court_width = window.innerWidth;

var window_width = 0.80 * max_court_width ;
//window_height = 0.80 * 2 * max_court_width;
var window_height = 0.80 * max_court_width;

canvasleft.width = window_width;
canvasleft.height = window_height;

canvasleft.style.background = "#FFFFFF";

contextleft.clearRect(0, 0, window_width , window_height)

var mysymbols = getSymbolsFromSetterPosition(1);

var mylineupteamA = new Lineup(
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
mylineup.draw();


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
var mylineupright = mylineupteamB;
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

    if (mylineup.team == "teamA") {
        console.log("Swapping courts with teamA originally on the left")
        mylineup = mylineupteamB;
        mylineupright = mylineupteamA;
    } else {
        console.log("Swapping courts with teamA originally on the right")
        mylineup = mylineupteamA;
        mylineupright = mylineupteamB;
    }

    mylineup.assignContext(contextleft);
    mylineup.leftcourt = !mylineup.leftcourt;
    mylineupright.assignContext(contextright);
    mylineupright.leftcourt = !mylineupright.leftcourt;

    var temptotal_angle = mylineup.total_angle;
    mylineup.total_angle = mylineupright.total_angle ;
    mylineupright.total_angle = temptotal_angle ;

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









