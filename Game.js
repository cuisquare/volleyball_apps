
class Game {
    constructor(venue,starttime,endtime,teamA,teamB) {
        this.venue = venue;
        this.starttime = starttime;
        this.endtime = endtime;
        this.teamA = teamA;
        this.teamB = teamB;
        this.teamA.servingfirst = true;
        this.teamB.servingfirst = false;
    }
}

// Export the class to make it accessible in other files
export default Game;