import {getSymbolsFromSetterPosition} from './utils.js';

import Lineup from './Lineup.js';

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

max_court_width = Math.min(window.innerWidth,window.innerHeight)
max_court_height = Math.min(window.innerWidth,window.innerHeight)

//max_court_width = window.innerWidth;

window_width = 0.80 * max_court_width ;
//window_height = 0.80 * 2 * max_court_width;
window_height = 0.80 * max_court_width;

canvas.width = window_width;
canvas.height = window_height;

canvas.style.background = "#FFFFFF";

context.clearRect(0, 0, window_width , window_height)

mysymbols = getSymbolsFromSetterPosition(1);
mylineup = new Lineup([5,9,45,23,12,7],mysymbols,context, total_angle = 0, leftcourt = true);
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

mylineupright = new Lineup([3,10,8,7,13,4],mysymbols,contextright, total_angle = 0, leftcourt = false);
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



// Function to convert mouse coordinates to rotated canvas coordinates
function convertToRotatedCoords(x, y, rotationAngle,centerX = this.canvas.width / 2, centerY = this.canvas.height / 2) {
    //const centerX = this.canvas.width / 2;
    //const centerY = this.canvas.height / 2;

    // Calculate the angle between the mouse position and the canvas center
    const angle = Math.atan2((y - centerY), x - centerX) ;

    // Calculate the distance between the mouse position and the canvas center
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    // Adjust the angle based on the rotation angle of the canvas
    const adjustedAngle = angle - rotationAngle;

    // Calculate the rotated coordinates
    const rotatedX = centerX + distance * Math.cos(adjustedAngle);
    const rotatedY = centerY + distance * Math.sin(adjustedAngle);

    return { x: rotatedX, y: rotatedY };
}


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


/*
function animate(isOver = false) {
    isOver = mylineup.draw(context);
    if (!isOver) {
        requestAnimationFrame(animate);
    }
}
*/







