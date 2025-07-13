import Fixture from './Fixture.js';
import Rules from './Rules.js';
import Game from './Game.js';

document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("dark-mode-toggle");
    
    // Check for saved theme preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    toggleButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        // Save preference to local storage
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    });
});

var lvarules = new Rules(
    21, 
    2,
    15,
    2,
    2,
    true,
    8,
    14,
    2
)

console.log("rules successfully created!")
console.log(lvarules)


var hometeam_name = "Home team (default)";
var awayteam_name = "Away team (default)";

var my_fixture_date = new Date('2025-02-02T16:00:00');
const myfixture = new Fixture("45", 
                                   "Chestnut Grove Academy",
                                   my_fixture_date,
                                   "16:20",
                                   "18:00", 
                                   hometeam_name,
                                   awayteam_name,
                                   lvarules);
console.log("myfixture successfully created!")
console.log(myfixture)


const mygame = new Game(myfixture);

//things decided after toss
//mygame.teamA = "home"
//mygame.team_serving_startset = "teamB"

//team A choices
var servingTeamChoiceTeamAHomeElement = document.getElementById("servingTeamChoiceTeamAHome")
servingTeamChoiceTeamAHomeElement.textContent =  mygame.fixture.hometeam_name;
var servingTeamChoiceTeamAAwayElement = document.getElementById("servingTeamChoiceTeamAAway")
servingTeamChoiceTeamAAwayElement.textContent =  mygame.fixture.awayteam_name;


console.log("mygame successfully created!")
console.log(mygame)
console.log("initially state of game is: ")
console.log(mygame.getMatchStatus())

function updateTeamNames() {


    mygame.fixture.hometeam_name = window.prompt("Enter home team name")
    mygame.fixture.awayteam_name = window.prompt("Enter away team name")

    var servingTeamChoiceTeamAHomeElement = document.getElementById("servingTeamChoiceTeamAHome")
    servingTeamChoiceTeamAHomeElement.textContent =  mygame.fixture.hometeam_name;
    var servingTeamChoiceTeamAAwayElement = document.getElementById("servingTeamChoiceTeamAAway")
    servingTeamChoiceTeamAAwayElement.textContent =  mygame.fixture.awayteam_name;
}

document.getElementById('teamNamesInput').addEventListener('click', function() {
    updateTeamNames();
});

var fullShirtNumbersArrayTeamA = [1,2,3,4,5,6,7,8,9];
mygame.lineup_hometeam.fullshirtnums = fullShirtNumbersArrayTeamA;
var fullShirtNumbersArrayTeamB = [4,5,6,7,8,9,10,11,12];
mygame.lineup_awayteam.fullshirtnums = fullShirtNumbersArrayTeamB;

var lineupShirtNumbersArrayTeamA = [];
var lineupShirtNumbersArrayTeamB = [];

function getUserInputShirtNums(numbersArray) {
    let defaultInput = numbersArray.length ? numbersArray.join(", ") : "";
    let userInput = prompt("Enter numbers separated by commas:", defaultInput);
    
    if (userInput !== null) {
        numbersArray = userInput.split(",")
            .map(num => parseInt(num.trim(), 10))
            .filter(num => !isNaN(num));
        numbersArray = [...new Set(numbersArray)]; // Remove duplicates
        numbersArray.sort((a, b) => a - b);
        //document.getElementById("output").textContent = "Sorted Numbers: " + numbersArray.join(", ");
    }

    return numbersArray
}

//TODO deal with when the tshirts setup bit is visible / not visible (once at start of game)
//TODO deal with when the lineup setup bit is visible / not visible (once at start of each set, but not until the tshirt setup is done)
//TODO deal with the recording of the lineups throughout the game - during the set, at end of set
//TODO deal with substitutions including what is allowed
//TODO deal with libero role....
//TODO deal with libero retiring/ reassigning
//TODO displaying lineup on UI
//TODO lineup display to show who is the server
//TODO lineup display to show position of players on court
//TODO don't let the game scoring starts unless a lineup is entered

document.getElementById('teamShirtNumsInput').addEventListener('click', function() {
    fullShirtNumbersArrayTeamA = getUserInputShirtNums(fullShirtNumbersArrayTeamA);
    fullShirtNumbersArrayTeamB = getUserInputShirtNums(fullShirtNumbersArrayTeamB);
});

function getUserInputLineups(allowedNumbersArray, lastselectionnumbers) {
    var allowedNumbersArrayAsCSV = allowedNumbersArray.join(", ");
    //console.log(allowedNumbersArrayAsCSV)
    let userInput = prompt(`Enter numbers separated by commas to indicate lineup from position 1 to 6. Max 6 numbers, allowed values : ${allowedNumbersArrayAsCSV}`, lastselectionnumbers);
    
    if (userInput == null) {
        return
    }

    var numbersArray = userInput.split(",")
        .map(num => parseInt(num.trim(), 10))
        .filter(num => !isNaN(num));
    numbersArray = [...new Set(numbersArray)]; // Remove duplicates

    //check that the resulting numbersArray is exactly 6 numbers, all included in allowedNumbersArray
    if (numbersArray.length != 6) {
        console.warn("Invalid lineup, you must select 6 numbers.")
        return
    }

    if (!(numbersArray.every(num => allowedNumbersArray.includes(num)))) {
        console.warn(`Invalid lineup, you must select only numbers in the squad list: ${allowedNumbersArrayAsCSV}. Add players to the squad list before you can add to line up.`)
        return
    }

    return numbersArray
}

document.getElementById('teamSetLinupInput').addEventListener('click', function() {
    lineupShirtNumbersArrayTeamA = getUserInputLineups(fullShirtNumbersArrayTeamA, lineupShirtNumbersArrayTeamA )
    lineupShirtNumbersArrayTeamB = getUserInputLineups(fullShirtNumbersArrayTeamB, lineupShirtNumbersArrayTeamB );
});

function updateTeamPosition() {
    const container = document.querySelector('.teams-container');
    if (mygame.onLeft) {
      container.classList.add('left');
      container.classList.remove('right');
    } else {
      container.classList.add('right');
      container.classList.remove('left');
    }
}

function updateScoringServingValues() {
    var nameteamAElement = document.getElementById(`name-teamA`);
    nameteamAElement.textContent = mygame.getTeamName("teamA");
    var nameteamBElement = document.getElementById(`name-teamB`);
    nameteamBElement.textContent = mygame.getTeamName("teamB");
    var scoreElement = document.getElementById(`score-teamA`);
    scoreElement.textContent = mygame.currentSet["teamA"];
    var setElement = document.getElementById(`sets-teamA`);
    setElement.textContent = mygame.setWins["teamA"];
    var pointsElement = document.getElementById(`points-teamA`);
    pointsElement.textContent = mygame.totalPoints["teamA"];
    scoreElement = document.getElementById(`score-teamB`);
    scoreElement.textContent = mygame.currentSet["teamB"];
    setElement = document.getElementById(`sets-teamB`);
    setElement.textContent = mygame.setWins["teamB"];
    pointsElement = document.getElementById(`points-teamB`);
    pointsElement.textContent = mygame.totalPoints["teamB"];
    var servingstateElement = document.getElementById("servingstate-teamA");
    servingstateElement.textContent = mygame.servingstate["teamA"] 
    servingstateElement = document.getElementById("servingstate-teamB");
    servingstateElement.textContent =  mygame.servingstate["teamB"]; 
    var gameStatusElement = document.getElementById("game-status");
    gameStatusElement.textContent =  mygame.getGameStatus();  
}

function updateUIElementsVisibility() {

    var completeButtonsElement = document.getElementById("completeButtons");
    var teamDetailsInputElement = document.getElementById("teamDetailsInput");

    var homeTeamNameChoiceElement = document.getElementById("homeTeamNameChoice");
    var teamStartingLeftChoiceElement = document.getElementById("teamStartingLeftChoice");
    var servingTeamChoiceElement = document.getElementById("servingTeamChoice");

    var ongoingSetStateTeamAElement = document.getElementById("ongoingSetStateTeamA");
    var ongoingSetStateTeamBElement = document.getElementById("ongoingSetStateTeamB");
    var accruedSetsPointsTeamAElement = document.getElementById("accruedSetsPointsTeamA");
    var accruedSetsPointsTeamBElement = document.getElementById("accruedSetsPointsTeamB");

    var gameInputsElement = document.getElementById("gameInputs");

    if (!mygame.isPreGameToss) {
        homeTeamNameChoiceElement.style.display = "none";
        teamDetailsInputElement.style.display = "none";

        var servingstateElement = document.getElementById("servingstate-teamA");
        servingstateElement.style.display = "none";
        servingstateElement = document.getElementById("servingstate-teamB");
        servingstateElement.style.display = "none";
    }

    if (!mygame.isPreDeciderToss) {
        teamStartingLeftChoiceElement.style.display = "none";
        var servingstateElement = document.getElementById("servingstate-teamA");
        servingstateElement.style.display = "none";
        servingstateElement = document.getElementById("servingstate-teamB");
        servingstateElement.style.display = "none";
    }

    if (mygame.isPreDeciderToss) {
        teamStartingLeftChoiceElement.style.display = "";
        var servingstateElement = document.getElementById("servingstate-teamA");
        servingstateElement.style.display = "";
        servingstateElement = document.getElementById("servingstate-teamB");
        servingstateElement.style.display = "";
    }

    var startordeciderset = mygame.isPreGameToss | mygame.isPreDeciderToss;

    if (!startordeciderset) {
        servingTeamChoiceElement.style.display = "none";
        servingstateElement = document.getElementById("servingstate-teamA");
        servingstateElement.style.display = "";
        servingstateElement = document.getElementById("servingstate-teamB");
        servingstateElement.style.display = "";
    }
    if (startordeciderset) {
        servingTeamChoiceElement.style.display = "";
    }

    if (mygame.isGameOver) {
        completeButtonsElement.style.display = "none";
        // servingstateElement = document.getElementById("servingstate-teamA");
        // servingstateElement.style.display = "none";
        // servingstateElement = document.getElementById("servingstate-teamB");
        // servingstateElement.style.display = "none";
        ongoingSetStateTeamAElement.style.display = "none";
        //accruedSetsPointsTeamAElement.style.display = "none";
        ongoingSetStateTeamBElement.style.display = "none";
        //accruedSetsPointsTeamBElement.style.display = "none";

        gameInputsElement.style.display = "none";
    }
}

function updateSetsElements() {

    updateTeamPosition();

    //updating scoring elements
    updateScoringServingValues();

    //updating UI elements visibility
    updateUIElementsVisibility();

    console.log(mygame.getMatchStatus())
}

updateSetsElements();

document.getElementById('completeSet').addEventListener('click', function() {
    mygame.completeSet();
    updateSetsElements();
});

document.getElementById('completeGame').addEventListener('click', function() {
    var confirmationCompleteGame = prompt("Are you sure you want to interrupt the game before completion on sets won? (Y/N)")
    if (confirmationCompleteGame == "Y") {
        mygame.completeGame();
        mygame.interruptReason = window.prompt("Please enter an interruption reason (typically, Booking Elapsed)");
        updateSetsElements();
    }
});

function actionSideChoices() {
    if (mygame.isPreGameToss) {
        var teamANameElement = document.querySelector('input[name="homeeorawayteamA"]:checked');
        console.warn(`teamA name is ${teamANameElement.value}`)
        mygame.teamA = teamANameElement.value;

        var nameteamAElement = document.getElementById(`name-teamA`);
        nameteamAElement.textContent = mygame.getTeamName("teamA");
    
        var nameteamBElement = document.getElementById(`name-teamB`);
        nameteamBElement.textContent = mygame.getTeamName("teamB");
    } 

    if (mygame.isPreDeciderToss) {
        var teamLeftElement = document.querySelector('input[name="teamAorBStartingLeft"]:checked');
        if (teamLeftElement.value == "teamA") {mygame.onLeft = true;}
        if (teamLeftElement.value == "teamB") {mygame.onLeft = false;} 
        updateTeamPosition();      
    } 

    
    updateSetsElements();
}

document.getElementById("nameTeamA").addEventListener('click', function() {
    actionSideChoices();
});

document.getElementById("nameTeamStartingLeft").addEventListener('click', function() {
    console.warn("team sarting left for decider set was decided")
    actionSideChoices();
});


document.getElementById('servingTeam').addEventListener('click', function() {

    //var servingTeam = prompt(`Enter the serving team (teamA or teamB) for set ${mygame.getCurrentSet()}:`);
    var servingTeamElement = document.querySelector('input[name="team"]:checked');
    console.warn(`team to serve value is ${servingTeamElement.value}`)
    if (mygame.isPreGameToss) {
        mygame.team_serving_startset = servingTeamElement.value;
    } 
    if (mygame.isPreDeciderToss) {
        mygame.team_serving_deciderset = servingTeamElement.value;
    }    

    var servingstateElement = document.getElementById("servingstate-teamA");
    servingstateElement.textContent = mygame.servingstate["teamA"] 
    servingstateElement = document.getElementById("servingstate-teamB");
    servingstateElement.textContent =  mygame.servingstate["teamB"]; 

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

