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

        //game interrupted
        this.game_interrupted = false;
        
        //game state
        this.currentSetAcceptingMorePoints = true;
        this.gameWinner = "Unknown";
        this.isGameOver = false;
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
            return
        }
        if (homeoraway == "home") {
            return this.fixture.hometeam_name;
        } else {
            return this.fixture.awayteam_name;
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

    updateScore(team, points) {

        if (!(this.currentSetAcceptingMorePoints) & (points>0)) {
            console_plus_popup_warn("current set cannot accept more points")
            return
        }

        if (this.isGameOver) {
            console_plus_popup_warn("game is over, cannot update scores.")
            return
        }

        if (!(team === "teamA" || team === "teamB")) {
            console_plus_popup_warn("Invalid team. Use 'teamA' or 'teamB'.");
            return
        }


        var points_otherteam = this.getOtherTeamScore(team)

        var futurepoints_thisteam = this.currentSet[team] + points

        if (futurepoints_thisteam < 0) {
            console_plus_popup_warn(`Invalid number of points ${points} bringing negative score of ${futurepoints_thisteam}. Will remove points only up to zero.`);
            points = - this.currentSet[team];
            futurepoints_thisteam = this.currentSet[team] + points
        }

        var futurepoints_difference = futurepoints_thisteam - points_otherteam;

        if (futurepoints_thisteam > this.fixture.rules.regsetpts & futurepoints_difference >2) {
            console_plus_popup_warn("Invalid number of points. Maximum number of points is 25.");
            points = this.fixture.rules.regsetpts - this.currentSet[team];
            futurepoints_thisteam = this.currentSet[team] + points
            futurepoints_difference = futurepoints_thisteam - points_otherteam;
        }

        this.currentSet[team] += points;

        var twopointsdifferenceormore = (futurepoints_difference >= 2) 
        var minimumptstoendsetreached = futurepoints_thisteam >= this.fixture.rules.regsetpts
        if (twopointsdifferenceormore & minimumptstoendsetreached) {
            //this.completeSet()
            this.currentSetAcceptingMorePoints = false;
        } else {
            this.currentSetAcceptingMorePoints = true;
        }
    }

    completeSet() {

        if (this.isGameOver) {
            console_plus_popup_warn("cannot complete set as game already over.")
            return
        }

        const { teamA, teamB } = this.currentSet;
        this.sets.push({ teamA, teamB });

        // Update set wins
        if ((teamA >= teamB +2)) {
            this.setWins.teamA += 1;
        } 
        if ((teamB >= teamA +2)) {
            this.setWins.teamB += 1;
        }

        // Reset current set
        this.currentSet = { teamA: 0, teamB: 0 };

        //Allow point to be added in that currentset
        this.currentSetAcceptingMorePoints = true;

        this.totalPoints = this.getTotalPoints()

        this.determineGameWinner();

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
                if (this.totalPoints["teamA"] > this.totalPoints["teamB"]) {
                    console.warn("teamA has more points than teamB")
                    this.gameWinner = "teamA"
                }
                if (this.totalPoints["teamB"] > this.totalPoints["teamA"]) {
                    console.warn("teamB has more points than teamA")
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
            sets: this.sets,
            currentSet: this.currentSet,
            setWins: this.setWins,
            totalPoints: this.totalPoints,
            isGameOver: this.isGameOver,
            gameWinner: this.gameWinner
        };
    }



}

// Export the class to make it accessible in other files
export default Game;