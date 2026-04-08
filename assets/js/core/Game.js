//contains the actual point by point actions in the game + subs + timeouts
//who won, who lost etc

import {console_plus_popup_warn} from './utils.js';

class Game {
    constructor(
        fixture, 
        ) {

        this.fixture = fixture;

        //points and sets update
        this.sets = [];
        this.currentSet = { teamA: 0, teamB: 0 };
        this.setWins = { teamA: 0, teamB: 0 };
        this.totalPoints = { teamA: 0, teamB: 0 };
        this.pointHistory = [];
        this.redoHistory = [];
        this.history = {
            version: 1,
            events: [],
            sets: [],
            placeholders: {
                substitutions: [],
                penalties: [],
                setTimes: [],
                timeouts: []
            }
        };

        //game interrupted
        this.game_interrupted = false;
        this.interruptReason = "";

        //servingstuff
        this.servingstate = { teamA: "Unknown", teamB: "Unknown" };
        this.team_serving_before = "Unknown"
        this._team_serving_startset = "Unknown";
        this._team_serving_deciderset = "Unknown";
        this.resetCurrentServingState();
        
        //position stuff
        this._teamA = "Unknown"
        this._teamB = "Unknown"

        //teampositionstuff
        this.onLeft = true; // whether teamA is on left side from the point of view of scorer
        
        //game state
        this.currentSetAcceptingMorePoints = true;
        this.gameWinner = "Unknown";
        this.isGameOver = false;
    }

    get isPreGameToss() {
        return ((this.getCurrentSet() == 1 & this.team_serving_startset == "Unknown") | (this.teamA == "Unknown"));
    }

    get isPreDeciderToss() {
        return((this.setWins["teamA"] == (this.fixture.rules.nbsetswin -1)) & (this.setWins["teamB"] == (this.fixture.rules.nbsetswin -1)) & this.team_serving_deciderset == "Unknown" );
    }


    set teamA(value) {
        if (value === "home" || value === "away") {
            this._teamA = value;
            this._teamB = value === "home" ? "away" : "home";
        } else {
            throw new Error('Invalid value for teamA. Allowed values are "home" or "away".');
        }
    }

    get teamA() {
        return this._teamA;
    }

    set teamB(value) {
        if (value === "home" || value === "away") {
            this._teamB = value;
            this._teamA = value === "home" ? "away" : "home";
        } else {
            throw new Error('Invalid value for teamB. Allowed values are "home" or "away".');
        }
    }

    get teamB() {
        return this._teamB;
    }

    set team_serving_startset(value) {
        if (value === "teamA" || value === "teamB") {
            this._team_serving_startset= value;
            this.team_serving_currently = value;
        } else {
            throw new Error('Invalid value Allowed values are "teamA" or "teamB".');
        }
    }

    get team_serving_startset() {
        return this._team_serving_startset;
    }

    set team_serving_deciderset(value) {
        if (value === "teamA" || value === "teamB") {
            this._team_serving_deciderset= value;
            this.team_serving_currently = value;
        } else {
            throw new Error('Invalid value Allowed values are "teamA" or "teamB".');
        }
    }

    get team_serving_deciderset() {
        return this._team_serving_deciderset;
    }

    set team_serving_currently(value) {
        if (value === "teamA" || value === "teamB") {
            this._team_serving_currently= value;
            this.servingstate[value] = this.getServingState(value)
            this.servingstate[this.getOtherTeam(value)] = this.getServingState(this.getOtherTeam(value))
        } else {
            throw new Error('Invalid value Allowed values are "teamA" or "teamB".');
        }
    }

    get team_serving_currently() {
        return this._team_serving_currently;
    }

    //teamA name from fixture
    getTeamName(team) {
        var homeoraway;
        if (team === "teamA") {
            homeoraway = this.teamA
        } else if (team === "teamB") {
            homeoraway = this.teamB
        } else {
            console.warn("Invalid team. Use 'teamA' or 'teamB'.");
            return "Unknown"
        }
        if (homeoraway == "home") {
            return this.fixture.hometeam_name;
        }        
        if (homeoraway == "away") {
            return this.fixture.awayteam_name;
        }
        return "Unknown"
    }

    getServingState(team) {
        var servingstate = ""
        if (this.team_serving_currently == team) {
            servingstate = "Serving";
        } 
        if (this.team_serving_currently == this.getOtherTeam(team)) {
            servingstate = "Receiving";
        }        
        if (this.team_serving_currently == "Unknown") {
            servingstate = "Unknown";
        }
        return servingstate;
    }

    //otherteam
    getOtherTeam(team) {
        if (team === "teamA") {
            return "teamB";
        } else if (team === "teamB") {
            return "teamA";
        } else {
            throw new Error("Invalid team. Use 'teamA' or 'teamB'.");
        }
    }

    //points tracking
    getOtherTeamScore(team) {
        if (team === "teamA") {
            return this.currentSet.teamB;
        } else if (team === "teamB") {
            return this.currentSet.teamA;
        } else {
            throw new Error("Invalid team. Use 'teamA' or 'teamB'.");
        }
    }

    isDeciderSet() {
        return ((this.setWins["teamA"] == (this.fixture.rules.nbsetswin -1)) & (this.setWins["teamB"] == (this.fixture.rules.nbsetswin -1)))
    }

    getNbSetPts() {
        var nbsetpts = this.fixture.rules.regsetpts;
        if (this.isDeciderSet()) {
            nbsetpts = this.fixture.rules.decidersetpts;
        }
        return nbsetpts
    }

    updateScore(team, points) {

        //do not allow points to be updated if the current server is unknown
        if (this.team_serving_currently == "Unknown") {
            console_plus_popup_warn("select serving team before points can be added. ")
            return false
        }


        if (!(this.currentSetAcceptingMorePoints) & (points>0)) {
            console_plus_popup_warn("current set cannot accept more points")
            return false
        }

        if (this.isGameOver) {
            console_plus_popup_warn("game is over, cannot update scores.")
            return false
        }

        if (!(team === "teamA" || team === "teamB")) {
            console_plus_popup_warn("Invalid team. Use 'teamA' or 'teamB'.");
            return false
        }


        var points_otherteam = this.getOtherTeamScore(team)

        var futurepoints_thisteam = this.currentSet[team] + points

        if (futurepoints_thisteam < 0) {
            console_plus_popup_warn(`Invalid number of points ${points} bringing negative score of ${futurepoints_thisteam}. Will remove points only up to zero.`);
            points = - this.currentSet[team];
            futurepoints_thisteam = this.currentSet[team] + points
        }

        var futurepoints_difference = futurepoints_thisteam - points_otherteam;

        if (futurepoints_thisteam > this.getNbSetPts() & futurepoints_difference >2) {
            console_plus_popup_warn(`Invalid number of points. Maximum number of points is ${this.getNbSetPts()}.`);
            points = this.getNbSetPts() - this.currentSet[team];
            futurepoints_thisteam = this.currentSet[team] + points
            futurepoints_difference = futurepoints_thisteam - points_otherteam;
        }

        this.currentSet[team] += points;
        if (points == 0) {
            return false
        }

        //updating the serving team
        if (points ==1) {
            //keeping track of who was last serving
            this.team_serving_before = this.team_serving_currently;
            this.team_serving_currently = team;
        }
        if ((points == -1) & (this.team_serving_before  != this.team_serving_currently) & (this.team_serving_before != "Unknown")) {
            this.team_serving_currently = this.team_serving_before;
            this.team_serving_before = "Unknown"
            //here add something so that there can only be 1 point removed and anything else requires manual edit. 
            //or, that there can be only one negative / positive amount applied ?

        }

        var twopointsdifferenceormore = (futurepoints_difference >= 2) 
        var minimumptstoendsetreached = futurepoints_thisteam >= this.getNbSetPts()
        if (twopointsdifferenceormore & minimumptstoendsetreached) {
            //this.completeSet()
            this.currentSetAcceptingMorePoints = false;
        } else {
            this.currentSetAcceptingMorePoints = true;
        }

        //deal with case where we swap sides at n points in decider set
        var doswapsidenow = this.fixture.rules.swapsidesindecider & this.isDeciderSet() & (this.currentSet[team] == this.fixture.rules.nbptsforswap) & (this.currentSet[this.getOtherTeam(team)] < this.fixture.rules.nbptsforswap)
        if (doswapsidenow) {
            //do something
            this.onLeft = !this.onLeft;
            console_plus_popup_warn("Team swapping sides!")
            //TODO code the going back to previous position because points reversed...
        }

        return true
    }

    getUndoSnapshot() {
        return {
            currentSet: { ...this.currentSet },
            currentSetAcceptingMorePoints: this.currentSetAcceptingMorePoints,
            team_serving_currently: this.team_serving_currently,
            team_serving_before: this.team_serving_before,
            onLeft: this.onLeft
        };
    }

    awardPoint(team) {
        const snapshot = this.getUndoSnapshot();
        const pointAdded = this.updateScore(team, 1);
        if (pointAdded) {
            this.pointHistory.push(snapshot);
            // New scoring action supersedes any pending redo chain.
            this.redoHistory = [];
            this.logEvent('point_awarded', {
                team,
                currentSet: { ...this.currentSet },
                servingTeam: this.team_serving_currently,
                setNumber: this.getCurrentSet()
            });
            return true;
        }
        return false;
    }

    undoLastPoint() {
        if (this.pointHistory.length === 0) {
            console_plus_popup_warn("No points to undo in the current set.");
            return false;
        }

        this.redoHistory.push(this.getUndoSnapshot());
        const snapshot = this.pointHistory.pop();
        this.currentSet = { ...snapshot.currentSet };
        this.currentSetAcceptingMorePoints = snapshot.currentSetAcceptingMorePoints;
        this.onLeft = snapshot.onLeft;
        this.team_serving_before = snapshot.team_serving_before;

        if (snapshot.team_serving_currently === "Unknown") {
            this.resetCurrentServingState();
        } else {
            this.team_serving_currently = snapshot.team_serving_currently;
        }
        this.logEvent('point_undone', {
            currentSet: { ...this.currentSet },
            servingTeam: this.team_serving_currently,
            setNumber: this.getCurrentSet()
        });

        return true;
    }

    redoLastPoint() {
        if (this.redoHistory.length === 0) {
            console_plus_popup_warn("No points to redo in the current set.");
            return false;
        }

        this.pointHistory.push(this.getUndoSnapshot());
        const snapshot = this.redoHistory.pop();
        this.currentSet = { ...snapshot.currentSet };
        this.currentSetAcceptingMorePoints = snapshot.currentSetAcceptingMorePoints;
        this.onLeft = snapshot.onLeft;
        this.team_serving_before = snapshot.team_serving_before;

        if (snapshot.team_serving_currently === "Unknown") {
            this.resetCurrentServingState();
        } else {
            this.team_serving_currently = snapshot.team_serving_currently;
        }
        this.logEvent('point_redone', {
            currentSet: { ...this.currentSet },
            servingTeam: this.team_serving_currently,
            setNumber: this.getCurrentSet()
        });

        return true;
    }

    resetCurrentServingState() {
        this._team_serving_currently = "Unknown";
        this.servingstate["teamA"] = "Unknown";
        this.servingstate["teamB"] = "Unknown";
    }

    updateTeamSides() {
        //next set number is even
        if (this.sets.length%2 == 1) {
            this.onLeft = false;
        } 
        //next set number is odd
        if (this.sets.length%2 == 0) {
            this.onLeft = true;
        } 
        //decider set
        if (this.isDeciderSet()) {
            this.onLeft = "Unknown";
        } 
    }

    updateTeamServingCurrentlyAtStartSet() {
        //next set number is even
        if (this.sets.length%2 == 1) {
            this.team_serving_currently = this.getOtherTeam(this.team_serving_startset)
        } 
        //next set number is odd
        if (this.sets.length%2 == 0) {
            this.team_serving_currently = this.team_serving_startset
        } 
        //decider set
        if (this.isDeciderSet()) {
            this.resetCurrentServingState();
        } 

    }

    setLegallyOver() {
        const { teamA, teamB } = this.currentSet;
        var setLegallyOver = ((teamA >= teamB +2) | (teamB >= teamA +2)) & ((teamB >= this.getNbSetPts()) | (teamA >= this.getNbSetPts()))
        return setLegallyOver;
    }

    //function called when actively completing a set. 
    //only runs if the set is valid to be completed. 
    completeSet(setLegalitysafeguards = true) {
        if (setLegalitysafeguards) {
            if (this.isGameOver) {
                console_plus_popup_warn("cannot complete set as game already over.")
                return
            }
    
            if (!this.setLegallyOver()) {
                console_plus_popup_warn("Cannot complete set because invalid number of points. Complete Game if game complete for reasons other than points. ")
                return
            }
        }


        const completedSetNumber = this.getCurrentSet();
        const { teamA, teamB } = this.currentSet;
        this.sets.push({ teamA, teamB });

        // Update set wins
        if (teamA >= (teamB +this.fixture.rules.ptsdiffwinset)) {
            this.setWins.teamA += 1;
        } 
        if (teamB >= (teamA +this.fixture.rules.ptsdiffwinset)) {
            this.setWins.teamB += 1;
        }
        this.history.sets.push({
            setNumber: completedSetNumber,
            score: { teamA, teamB },
            setWinsAfterSet: { ...this.setWins },
            sideAtEnd: this.onLeft,
            servingAtEnd: this.team_serving_currently
        });

        // Reset current set
        this.currentSet = { teamA: 0, teamB: 0 };
        this.pointHistory = [];
        this.redoHistory = [];

        //Allow point to be added in that currentset
        this.currentSetAcceptingMorePoints = true;

        this.totalPoints = this.getTotalPoints()

        this.determineGameWinner();

        if (!this.isGameOver) {
            this.updateTeamServingCurrentlyAtStartSet();
            this.updateTeamSides();
        }
        this.logEvent('set_completed', {
            setNumber: completedSetNumber,
            score: { teamA, teamB },
            setWins: { ...this.setWins },
            nextSetNumber: this.getCurrentSet()
        });

    }

    completeGame() {
        this.game_interrupted = true;
        this.isGameOver = true;
        this._team_serving_deciderset = "Game_interrupted";
        this.resetCurrentServingState();
        this.completeSet(false);
        this.logEvent('game_interrupted', {
            reason: this.interruptReason,
            gameWinner: this.gameWinner
        });
    }

    determineGameWinner() {
        this.gameWinner = "Unknown"

        //if game is over set it as such
        var max_number_sets_played = (this.sets.length == 2 * this.fixture.rules.nbsetswin-1)
        var team_won_nbssetswin = (Math.max(this.setWins.teamA, this.setWins.teamB) == this.fixture.rules.nbsetswin ) 

        this.isGameOver = max_number_sets_played | team_won_nbssetswin | this.game_interrupted;

        
        if (this.isGameOver) {
            
            if (this.setWins["teamA"] > this.setWins["teamB"]) {
                this.gameWinner = "teamA"
            }
            if (this.setWins["teamB"] > this.setWins["teamA"]) {
                this.gameWinner = "teamB"
            }
            if (this.gameWinner == "Unknown") {
                console.warn("Game Winner determined by Points Count")
                //if equal number of sets, winner is team with most points
                this.gameWinner = "Draw"
                console.warn(`total points teamA: ${this.totalPoints["teamA"]}`)
                console.warn(`total points teamB: ${this.totalPoints["teamB"]}`)
                if (this.totalPoints["teamA"] >= this.totalPoints["teamB"] + this.fixture.rules.ptsdiffwinpts ) {
                    console.warn(`teamA has ${this.fixture.rules.ptsdiffwinpts} points or more than teamB`)
                    this.gameWinner = "teamA"
                }
                if (this.totalPoints["teamB"] >= this.totalPoints["teamA"] +  this.fixture.rules.ptsdiffwinpts) {
                    console.warn(`teamB has ${this.fixture.rules.ptsdiffwinpts} points or more than teamA`)
                    this.gameWinner = "teamB"
                }
                console.warn(`Game Winner: ${this.gameWinner}`)
            }
            this.currentSetAcceptingMorePoints = false;
        }
    }

    getTotalPoints() {
        // Calculate total points for teamA and teamB
        const totalPoints = this.sets.reduce(
            (totals, set) => {
            totals.teamA += set.teamA;
            totals.teamB += set.teamB;
            return totals;
            },
            { teamA: 0, teamB: 0 } // Initial value
        );

        return totalPoints
    }

    getMatchStatus() {
        return {
            rules: this.fixture.rules,
            team_serving_startset: this.team_serving_startset,
            isPreGameToss: this.isPreGameToss,
            isPreDeciderToss: this.isPreDeciderToss,
            nbsetpoints: this.getNbSetPts(),
            teamA: this.teamA,
            teamB: this.teamB,
            teamAName: this.getTeamName("teamA"),
            teamBName: this.getTeamName("teamB"),
            teamservingcurrently: this.team_serving_currently,
            servingstateteamA: this.getServingState("teamA"),
            servingstateteamB: this.getServingState("teamB"),
            sets: this.sets,
            currentSet: this.currentSet,
            setWins: this.setWins,
            totalPoints: this.totalPoints,
            isGameOver: this.isGameOver,
            gameWinner: this.gameWinner
        };
    }

    getCurrentSet() {
        var output = this.sets.length +1
        if (this.isGameOver) {
            output = 0
        }
        return output
    }

    getGameStatus() {
        var output = "Set " + this.getCurrentSet();
        
        if (this.isGameOver) {
            output = "Game Over";
            output = output + " - " + this.gameWinner
            if (this.gameWinner != "Draw") {
                output = output  + " wins by "
                if (this.setWins["teamA"] != this.setWins["teamB"]) {
                    var sornot = ""
                    if (this.setWins[this.gameWinner] > 1) {sornot = "s"}
                    output = output  + this.setWins[this.gameWinner] + " set" + sornot + " to " + this.setWins[this.getOtherTeam(this.gameWinner)]
                } else {
                    output = output  + this.totalPoints[this.gameWinner] + " points to " + this.totalPoints[this.getOtherTeam(this.gameWinner)]
                }
            }
            if (this.game_interrupted) {
                output = output + ` (Game interrupted: ${this.interruptReason})`;
            }

        }
        return output
    }

    logEvent(type, payload = {}) {
        this.history.events.push({
            index: this.history.events.length + 1,
            type,
            at: new Date().toISOString(),
            payload
        });
    }

    addExternalEvent(type, payload = {}) {
        this.logEvent(type, payload);
    }

    ensureSetTimeEntry(setNumber) {
        if (!Number.isInteger(setNumber) || setNumber < 1) {
            return null;
        }

        let entry = this.history.placeholders.setTimes.find((item) => item.setNumber === setNumber);
        if (!entry) {
            entry = {
                setNumber,
                startTime: '',
                actualStartTime: '',
                endTime: '',
                actualEndTime: ''
            };
            this.history.placeholders.setTimes.push(entry);
            this.history.placeholders.setTimes.sort((a, b) => a.setNumber - b.setNumber);
        }
        return entry;
    }

    recordSetStartTime(setNumber, startTime, actualStartTime) {
        const entry = this.ensureSetTimeEntry(setNumber);
        if (!entry) {
            return;
        }
        entry.startTime = startTime || '';
        entry.actualStartTime = actualStartTime || '';
    }

    recordSetEndTime(setNumber, endTime, actualEndTime = '') {
        const entry = this.ensureSetTimeEntry(setNumber);
        if (!entry) {
            return;
        }
        entry.endTime = endTime || '';
        entry.actualEndTime = actualEndTime || '';
    }

    getTimeoutsForSet(setNumber) {
        if (!Number.isInteger(setNumber) || setNumber < 1) {
            return [];
        }
        const timeoutEntries = Array.isArray(this.history.placeholders.timeouts)
            ? this.history.placeholders.timeouts
            : [];
        return timeoutEntries.filter((entry) => entry.setNumber === setNumber);
    }

    recordTimeout(setNumber, team, score) {
        if (!Array.isArray(this.history.placeholders.timeouts)) {
            this.history.placeholders.timeouts = [];
        }

        const entry = {
            setNumber,
            team,
            score,
            at: new Date().toISOString()
        };
        this.history.placeholders.timeouts.push(entry);
        this.logEvent('timeout_recorded', entry);
        return entry;
    }


}

// Export the class to make it accessible in other files
export default Game;
