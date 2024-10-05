//contains the actual point by point actions in the game + subs + timeouts
//who won, who lost etc

class Game {
    constructor(fixture) {


        this.fixture = fixture;

        //default values
        this.actualdate = this.fixture.officialdate;
        this.actualstarttime = this.fixture.officialstarttime;
        this.actualendtime = this.fixture.officialendtime;
        this.teamA = fixture.hometeam;
        this.teamB = fixture.awayteam;
        this.teamA.servingfirst = true;
        this.teamB.servingfirst = false;
        this.rules = rules;
    }
}

// Export the class to make it accessible in other files
export default Game;