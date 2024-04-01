import Player from './Player.js';

class Team {
    constructor(teamname,players=[], startinglineup=[],servingfirst = false,maxshirtnum = 99) {
        this.teamname = teamname;
        this.startinglineup = startinglineup;
        this.servingfirst = servingfirst;
        this.maxshirtnum = maxshirtnum;
        this.players = []

        players.forEach(player => {
            addPlayer(player);
        })

        this.startinglineup = startinglineup;
        this.servingfirst = servingfirst;

    }

    addPlayer(player) {
        if(!(player instanceof Player)) {
            throw('parameter `player` must be of class Player');
        }

        if(!this.validShirtNum(player.shirtnum)) {
            var message = "this shirtnum (" + player.shirtnum + ") already exists within team";
            throw(message);
        }

        if(player.shirtnum > this.maxshirtnum) {
            throw('the greatest shirt number allowed is', this.maxshirtnum);
        }       

        this.players.push(player);
    }

    validShirtNum(shirtnum) {
        //valid shirtnum if not shared by any other players
        //also if shirt number is less or equal to max shirt num
        var isvalidShirtNum = true;
        this.players.forEach(player => {
            if (shirtnum == player.shirtnum) {
                isvalidShirtNum = false;
            }
        })

        return isvalidShirtNum
    }

    nbLiberos() {
        var nbLiberos = 0;
        this.players.forEach(player => {
            if (player.isLibero) {
                nbLiberos ++; 
            }
        })
        return nbLiberos
    }

    nbRegularPlayers() {
        return (this.players.length - this.nbLiberos())
    }

    isComplete() {
        return this.nbRegularPlayers() >= 6
    }

    shirtNums() {
        shirtnums = []
        this.players.forEach(player => {
            shirtnums.push(player.shirtnum);
        })
        return shirtnums;
    }

    validLineup(lineup) {
        //all the shirtnumbers must be ones that are in the players shirtnumber
        shirtnums = this.shirtNums();
        lineup.forEach(shirtnum => {
            shirtnums.includes(shirtnum)
        })
    }
}

// Export the class to make it accessible in other files
export default Team;
