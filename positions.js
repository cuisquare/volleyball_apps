


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

class Lineup {
    constructor(shirtnums = [15,16,17,18,19,20], symbols = ["S","O1","M1","Opp","O2","M2"], maxshirtnum = 999) {
        this.shirtnums = shirtnums;
        this.symbols = symbols;
        this.positions = this.getPositions(shirtnums, symbols);
    }

    getPositions(shirtnums, symbols) {
        var positions = []// [new Position(1),new Position(2),new Position(3),new Position(4),new Position(5),new Position(6),];
        var pos = 1;
        shirtnums.forEach(shirtnum => {
            console.log("pos:", pos)
            console.log("shirtnum:", shirtnum)
            var symbol = symbols[shirtnums.indexOf(shirtnum)]
            positions.push(new Position(pos, shirtnum,symbol));
            console.log("assigned shirtnum ",shirtnum, " to position ",pos," successfully")
            pos ++;
        })
        console.log("assigned all shirtnums to lineup successfully")
        return positions
    }

    rotateForward(n=1) {
        this.shirtnums = arrayRotateN(this.shirtnums, false,n);
        this.symbols = arrayRotateN(this.symbols, false,n);
        this.positions = this.getPositions(this.shirtnums, this.symbols);
    }

    rotateBackward(n=1) {
        /* var counter = 0
        while (counter < n) {
            this.shirtnums = arrayRotate(this.shirtnums,true);
            this.symbols = arrayRotate(this.symbols);
            counter +=1;
        } 
        */
        this.shirtnums = arrayRotateN(this.shirtnums, true,n);
        this.symbols = arrayRotateN(this.symbols, true,n);
        this.positions = this.getPositions(this.shirtnums, this.symbols);
    }

    draw(context) {
        drawcourt();
        this.positions.forEach( pos => {
            pos.draw(context);
        })
    }

}

function getSymbolsFromSetterPosition(setterpos = 2) {
    var symbols = ["S","O1","M1","Opp","O2","M2"]
    var index_increment = setterpos - 1;
    console.log("index_increment:",index_increment);
    symbols2 = arrayRotateN(symbols,true,index_increment)
    return symbols2
}

class Position {
    constructor(value, shirtnum, symbol = "P") {

        if(!([1,2,3,4,5,6].includes(value))) {
            throw('value can only take any of the following values: [1,2,3,4,5,6], but value attempt was: '+ value.toString() );
        }

        this.value = value;
        this.shirtnum = shirtnum;
        this.symbol = symbol;



        this.pos_width = 0.2*window_width;
        this.pos_height = 0.1*window_height;

        this.speed = 50;

        this.prevxpos = 50;
        this.prevypos = 50;

        this.isfrontrow = ([2,3,4].includes(value));
        this.isbackrow = ([5,6,1].includes(value));
        this.isleftside = ([4,5].includes(value));
        this.ismiddle = ([3,6].includes(value));
        this.isrightside = ([1,2].includes(value));

        if (this.isfrontrow) {
            this.ypos = 0.5*window_height/3.0
        } 
        if (this.isbackrow) {
            this.ypos = 0.666*window_height
        }
        if (this.isleftside) {
            this.xpos = 0.25*window_width
        } 
        if (this.ismiddle) {
            this.xpos = 0.5*window_width
        } 
        if (this.isrightside) {
            this.xpos = 0.75*window_width
        } 
    }

    prevposition() {
        var allvalues = [1,2,3,4,5,6]
        var currindex = allvalues.indexOf(this.value)
        var previndex = (currindex +7) % 6
        return allvalues[previndex]
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = "green";
        context.lineWidth = 3;
        context.rect(
            this.xpos - 0.5*this.pos_width,
            this.ypos - 0.5*this.pos_height,
            this.pos_width,
            this.pos_height);
        context.stroke();
        context.closePath();

        context.textAlign = "center";
        context.textBaseline = "middle"
        context.font = "20px Arial";
        if ((this.prevxpos != this.xpos) | (this.prevypos != this.ypos)) {
            //draw transition
        }
        context.fillText(this.shirtnum + "/" + this.symbol, this.xpos, this.ypos);
        context.lineWidth = 5;
        this.prevxpos = this.xpos;
        this.prevypos = this.ypos;
    }
}

class Player {
    constructor(shirtnum = 0,firstname="firstname",lastname = "lastname",regnum="00000",isLibero = false) {
        this.shirtnum = shirtnum;
        this.firstname = firstname;
        this.lastname = lastname;
        this.regnum = regnum;
        this.isLibero = isLibero;
    }


}

function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
}

function arrayRotateN(arr, reverse,n) {
    var counter = 0
    while (counter < n) {
        arr = arrayRotate(arr, reverse)
        counter +=1;
    }
    return arr;
}

var test_mode = false;
// the canvas things
if (!test_mode) {
    let canvas = document.getElementById("canvas");

    let context = canvas.getContext("2d");

    max_court_width = Math.min(window.innerWidth,0.5*window.innerHeight)
    
    window_width = 0.80 * max_court_width;
    window_height = 0.80 * 2 * max_court_width;

    canvas.width = window_width;
    canvas.height = window_height;
    canvas.style.background = "#FFFFFF";
    
    context.clearRect(0, 0, window_width , window_height)
    //TODO : draw the volleyball court line
    
    drawcourt = function() {
        context.beginPath();
        context.strokeStyle = "black";
        context.lineWidth = 5;
        //context.moveTo(0, 0); // Move the pen to (30, 50)
        context.rect(0,0,window_width,window_height);
        context.stroke();
        context.rect(0,0,window_width,window_height / 3.0);
        context.stroke();
        context.closePath();
    }

    mysymbols = getSymbolsFromSetterPosition(3);
    mylineup = new Lineup([5,9,45,23,12,7],mysymbols);
    mylineup.draw(context);
    
    document.getElementById('fwd').addEventListener('click',function(){
        context.clearRect(0, 0, canvas.width, canvas.height)
        mylineup.rotateForward();
        mylineup.draw(context);
    });
    
    document.getElementById('bck').addEventListener('click',function(){
        context.clearRect(0, 0, canvas.width, canvas.height)
        mylineup.rotateBackward();
        mylineup.draw(context);
    });
}


//testing it all
if (test_mode) {
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
    
    
}





