export function isCloseEnough(a,b,tolerance) {
    return Math.abs(a-b) < Math.abs(tolerance)
}

export default function getSymbolsFromSetterPosition(setterpos = 2) {
    var symbols = ["S","O1","M1","Opp","O2","M2"]
    var index_increment = setterpos - 1;
    console.log("index_increment:",index_increment);
    var symbols2 = arrayRotateN(symbols,true,index_increment)
    return symbols2
}

export function logmyobject(desc ="myobj",myobj) {
    console.log(desc + ": ");
    console.dir(myobj);
}

export function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
}

export function arrayRotateN(arr, reverse,n) {
    var counter = 0
    while (counter < n) {
        arr = arrayRotate(arr, reverse)
        counter +=1;
    }
    return arr;
}

// Function to convert mouse coordinates to rotated canvas coordinates
export function convertToRotatedCoords(x, y, rotationAngle,centerX, centerY) {
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
