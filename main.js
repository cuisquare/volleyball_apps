
import Lineup from './Lineup.js';
import getSymbolsFromSetterPosition from './utils.js';


let canvas = document.getElementById("canvasleft");
let context = canvas.getContext("2d");

var max_court_width = Math.min(window.innerWidth,window.innerHeight)
var max_court_height = Math.min(window.innerWidth,window.innerHeight)

//max_court_width = window.innerWidth;

var window_width = 0.80 * max_court_width ;
//window_height = 0.80 * 2 * max_court_width;
var window_height = 0.80 * max_court_width;

canvas.width = window_width;
canvas.height = window_height;

canvas.style.background = "#FFFFFF";

context.clearRect(0, 0, window_width , window_height)

var mysymbols = getSymbolsFromSetterPosition(1);

var mylineup = new Lineup(
    [5,9,45,23,12,7],
    mysymbols,
    context, 
    0, 
    true,
    window_width,
    window_height);
mylineup.addShirtnum(4);
mylineup.addShirtnum(10);
mylineup.draw();


let canvasright = document.getElementById("canvasright");
canvasright.width = window_width;
canvasright.height = window_height;
let contextright = canvasright.getContext("2d");

canvasright.style.background = "#FFFFFF";

contextright.clearRect(0, 0, window_width , window_height)
//contextright.fillStyle = 'blue';
//contextright.fillRect(0, 0, canvasright.width, canvasright.height);

var mylineupright = new Lineup(
    [3,10,8,7,13,4],
    mysymbols,
    contextright, 
    0, 
    false,
    window_width,
    window_height
    );
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









