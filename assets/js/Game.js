//contains the actual point by point actions in the game + subs + timeouts
//who won, who lost etc

class Game {
    constructor(
        fixture, 
        ) {

        this.fixture = fixture;


        //points and sets update
        this.sets = [];
        this.currentSet = { teamA: 0, teamB: 0 };
        this.setWins = { teamA: 0, teamB: 0 };
        
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
            console.warn("current set cannot accept more points")
            return
        }

        if (this.isGameOver) {
            console.warn("game is over, cannot update scores.")
            return
        }

        if (!(team === "teamA" || team === "teamB")) {
            console.warn("Invalid team. Use 'teamA' or 'teamB'.");
            return
        }


        var points_otherteam = this.getOtherTeamScore(team)

        var futurepoints_thisteam = this.currentSet[team] + points

        if (futurepoints_thisteam < 0) {
            console.warn(`Invalid number of points ${points} bringing negative score of ${futurepoints_thisteam}. Will remove points only up to zero.`);
            points = - this.currentSet[team];
            futurepoints_thisteam = this.currentSet[team] + points
        }

        var futurepoints_difference = futurepoints_thisteam - points_otherteam;

        if (futurepoints_thisteam > this.fixture.rules.regsetpts & futurepoints_difference >2) {
            console.warn("Invalid number of points. Maximum number of points is 25.");
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
            console.warn("cannot complete set as game already over.")
            return
        }

        const { teamA, teamB } = this.currentSet;
        this.sets.push({ teamA, teamB });

        // Update set wins
        var setWinner = "Unknown"
        if (teamA > teamB) {
            this.setWins.teamA += 1;
            setWinner = "teamA";
        } else {
            this.setWins.teamB += 1;
            setWinner = "teamB";
        }

        // Reset current set
        this.currentSet = { teamA: 0, teamB: 0 };

        //Allow point to be added in that currentset
        this.currentSetAcceptingMorePoints = true;

        //if game is over set it as such
        this.isGameOver = (Math.max(this.setWins.teamA, this.setWins.teamB) == this.fixture.rules.nbsetswin )
        if (this.isGameOver) {
            this.gameWinner = setWinner;
            this.currentSetAcceptingMorePoints = false;
        }
    }

    getMatchStatus() {
        return {
            sets: this.sets,
            currentSet: this.currentSet,
            setWins: this.setWins,
            isGameOver: this.isGameOver,
            gameWinner: this.gameWinner
        };
    }



}

// Export the class to make it accessible in other files
export default Game;