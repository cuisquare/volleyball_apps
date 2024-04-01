//testing it all
import {getSymbolsFromSetterPosition, logmyobject} from './utils.js';

import Lineup from './Lineup.js';
import Position from './Position.js';
import Player from './Player.js';
import Team from './Team.js';


window_width = 500;
window_height = 500;

myplayer = new Player(shirtnum = 15);
console.log(myplayer)
mylineup = new Lineup([5,9,45,23,12,7]);
console.log("mylineup:",mylineup)
console.log("rotating three times")
mylineup.rotateForward(3);
console.log("mylineup:",mylineup)
console.log("rotating back twice")
mylineup.rotateBackward(2);
console.log("mylineup:",mylineup)
console.log("mylineup:",JSON.stringify(mylineup, null, 4))

logmyobject("mylineup.getPositionFromValue(3)",mylineup.getPositionFromValue(3))

console.log("Creating team")
myteam = new Team("furious moomoos")
console.log("adding players to team")
myteam.addPlayer(new Player(shirtnum = 15, firstname = "ronnie", lastname = "theprious",regnum="13340"))
myteam.addPlayer(new Player(shirtnum = 17, firstname = "fufu", lastname = "pupu",regnum="13015"))
console.log(myteam)

try {
    myteam.addPlayer(new Player(shirtnum = 15, firstname = "lala", lastname = "themoomoo",regnum="13479"));
    } catch (error) {
    console.log("Error caught without interrupting:")
    console.error(error);
}

try {
    myteam.addPlayer(new Player(shirtnum = 1, firstname = "lala", lastname = "themoomoo",regnum="13479"));
    } catch (error) {
    console.log("Error caught without interrupting:")
    console.error(error);
}

console.log(myteam)

console.log("is my team complete?")

console.log(myteam.isComplete())

myteam.addPlayer(new Player(shirtnum = 20, firstname = "sonotronnie", lastname = "sonottheprious",regnum="77777"))

console.log(myteam)

console.log("is my team complete?")

console.log(myteam.isComplete())

myteam.addPlayer(new Player(shirtnum = 2, firstname = "ronnie", lastname = "theprious",regnum="13340"))
myteam.addPlayer(new Player(shirtnum = 3, firstname = "notronnie", lastname = "nottheprious",regnum="8956"))
myteam.addPlayer(new Player(shirtnum = 4, firstname = "wertwetr", lastname = "uuuuuuuuuuu",regnum="456",isLibero = true))
myteam.addPlayer(new Player(shirtnum = 5, firstname = "kjgkhjk", lastname = "lllllll",regnum="984",isLibero = true))

console.log(myteam)

console.log("is my team complete?")

console.log(myteam.isComplete())

console.log("nb regular players : ")
console.log(myteam.nbRegularPlayers())

console.log("nb liberos : ")
console.log(myteam.nbLiberos())

myposition = new Position(4,45,"S");
console.log("myposition position: ",myposition.value)
console.log("myposition.prevposition(): ",myposition.prevposition())


console.log("getSymbolsFromSetterPosition(1):",getSymbolsFromSetterPosition(1));
console.log("getSymbolsFromSetterPosition(2):",getSymbolsFromSetterPosition(2));
console.log("getSymbolsFromSetterPosition(3):",getSymbolsFromSetterPosition(3));
console.log("getSymbolsFromSetterPosition(4):",getSymbolsFromSetterPosition(4));
console.log("getSymbolsFromSetterPosition(5):",getSymbolsFromSetterPosition(5));
console.log("getSymbolsFromSetterPosition(6):",getSymbolsFromSetterPosition(6));