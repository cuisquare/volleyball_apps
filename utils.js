export function isCloseEnough(a,b,tolerance) {
    return Math.abs(a-b) < Math.abs(tolerance)
}

export default function getSymbolsFromSetterPosition(setterpos = 2) {
    var symbols = ["S","O1","M1","Opp","O2","M2"]
    var index_increment = setterpos - 1;
    console.log("index_increment:",index_increment);
    symbols2 = arrayRotateN(symbols,true,index_increment)
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
