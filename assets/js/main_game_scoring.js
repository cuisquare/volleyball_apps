import Fixture from './Fixture.js';
import Rules from './Rules.js';
import Game from './Game.js';

var lvarules = new Rules()
console.log("rules successfully created!")
console.log(lvarules)
var my_fixture_date = new Date('2025-02-02T16:00:00');
const myfixture = new Fixture("45", 
                                   "Chestnut Grove Academy",
                                   my_fixture_date,
                                   "16:20",
                                   "18:00", 
                                   "London Bears Men 2",
                                   "Brazukas All Stars",
                                   lvarules);
console.log("myfixture successfully created!")
console.log(myfixture)


const mygame = new Game(myfixture);

mygame.teamA = "home"

console.log("mygame successfully created!")
console.log(mygame)
console.log("initially state of game is: ")
console.log(mygame.getMatchStatus())

// console.log("adding 10 points to teamA")
// mygame.updateScore("teamA",10)

// console.log("state of game is: ")
// console.log(mygame.getMatchStatus())

// console.log("adding 15 points to teamB")
// mygame.updateScore("teamB",15)
// console.log("state of game is: ")
// console.log(mygame.getMatchStatus())

// console.log("adding 15 points to teama")
// mygame.updateScore("teamA",15)
// console.log("state of game is: ")
// console.log(mygame.getMatchStatus())

// console.log("adding 25 points to teamB")
// mygame.updateScore("teamB",25)
// console.log("state of game is: ")
// console.log(mygame.getMatchStatus())

// console.log("adding 25 points to teamA")
// mygame.updateScore("teamA",25)
// console.log("state of game is: ")
// console.log(mygame.getMatchStatus())

// console.log("adding 25 points to teamA")
// mygame.updateScore("teamA",25)
// console.log("state of game is: ")
// console.log(mygame.getMatchStatus())

function updateSetsElements() {
    var scoreElement = document.getElementById(`score-teamA`);
    scoreElement.textContent = mygame.currentSet["teamA"];
    var setElement = document.getElementById(`sets-teamA`);
    setElement.textContent = mygame.setWins["teamA"];
    scoreElement = document.getElementById(`score-teamB`);
    scoreElement.textContent = mygame.currentSet["teamB"];
    setElement = document.getElementById(`sets-teamB`);
    setElement.textContent = mygame.setWins["teamB"];
    console.log(mygame.getMatchStatus())
}

document.getElementById('completeSet').addEventListener('click', function() {
    mygame.completeSet();
    updateSetsElements();
});

document.getElementById('increase-score-teamA').addEventListener('click', function() {
    mygame.updateScore("teamA", 1);
    updateSetsElements();
});

document.getElementById('decrease-score-teamA').addEventListener('click', function() {
    mygame.updateScore("teamA", -1);
    updateSetsElements();
});

document.getElementById('increase-score-teamB').addEventListener('click', function() {
    mygame.updateScore("teamB", 1);
    updateSetsElements();
});

document.getElementById('decrease-score-teamB').addEventListener('click', function() {
    mygame.updateScore("teamB", -1);
    updateSetsElements();
});