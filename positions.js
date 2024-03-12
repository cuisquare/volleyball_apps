
let counterdebugillegalposition = 0;

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
    constructor(shirtnums = [15,16,17,18,19,20], symbols = ["S","O1","M1","Opp","O2","M2"], lucontext) {
        this.shirtnums = shirtnums;
        this.symbols = symbols;

        this.oldRules = false;

        this.context = lucontext;
        this.canvas = this.context.canvas;

        this.positions = this.getPositions(shirtnums, symbols,this.context);
        this.illegalPositions = [];
        this.illegalPositionTuples = [];
        this.notIllegalPositions = this.positions;
        this.newIllegalPositions = [];
        this.prevpositions = [];
        this.isMoving = false;
        logmyobject("lineup positions at creation time",this.positions);

        // Event listener for mouse move on the canvas
        /*
        this.canvas.addEventListener('mousemove', (event) => {
            //console.log("I redrew because of mouse movement")
            this.draw(); // Redraw the lineup on every mouse movement
        });
        */

        this.isDragging = false;
        this.draggingPositions = [];
        this.notDraggingPositions = this.positions;

        this.mdref = this.onMouseDown.bind(this);
        this.muref = this.onMouseUp.bind(this);
        this.mmref = this.onMouseMove.bind(this);
        this.mlref = this.onMouseLeave.bind(this);

        this.addEventListeners();

        //this.addPosListeners();

    }


    addEventListeners() {
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.mdref);
        this.canvas.addEventListener('mousemove', this.mmref);
        this.canvas.addEventListener('mouseup', this.muref);
        this.canvas.addEventListener('mouseleave', this.mlref);
    }

    addPosListeners() {
        // Event listener for mouse down on the canvas
        this.canvas.addEventListener('mousedown', (event) => {
            this.positions.forEach((pos,index) => {
                //logmyobject("calling mousedown on element index",index)
                pos.onMouseDown(event); // Call onMouseDown for each position
            });
        });

        // Event listener for mouse up on the canvas
        this.canvas.addEventListener('mouseup', (event) => {
            this.positions.forEach((pos,index) => {
                //logmyobject("calling mouseup on element index",index)
                pos.onMouseUp(event); // Call onMouseUp for each position
            });
        });

        this.canvas.addEventListener('mouseleave', (event) => {
            this.positions.forEach((pos,index) => {
                //logmyobject("BECAUSE OF MOUSE LEAVE, calling mouseup on element index",index)
                pos.onMouseLeave(event); // Call onMouseUp for each position
            });
        });
    }

    onMouseLeave(event) {
        this.positions.forEach((pos,index) => {
            //logmyobject("BECAUSE OF MOUSE LEAVE, calling mouseup on element index",index)
            pos.onMouseUp(event); // Call onMouseDown for each position
        });        
    }

    onMouseDown(event) {
        this.isDragging = false;
        this.notDraggingPositions = this.positions;
        this.positions.forEach((pos,index) => {
            //logmyobject("calling mousedown on element index",index)
            pos.onMouseDown(event); // Call onMouseDown for each position
            if (pos.isDragging) {
                //logmyobject("this object is dragging so turning all lineup to dragging",pos)
                this.isDragging = true;
                this.draggingPositions.push(pos);
                this.newIllegalPositions = [];
                this.removePositionsByValue(pos.value,this.notDraggingPositions);
            }
        });
        //this.checkPositionsLegalityStatic();
    }

    onMouseUp(event) {
        this.positions.forEach(pos => {
            //logmyobject("calling mouseup on element index",index)
            pos.onMouseUp(event); // Call onMouseUp for each position
        });
        if (this.isDragging) {
            //this.checkPositionsLegality();
        }
        //this.checkPositionsLegalityStatic(this.draggingPositions, this.notDraggingPositions);
        this.isDragging = false;
        this.draggingPositions = [];
        this.newIllegalPositions = [];
        this.notDraggingPositions = this.positions;
        
    }

    onMouseMove(event) {
        //console.log("I redrew because of mouse movement");
        if (this.isDragging) {
            this.checkPositionsLegalityStatic(this.draggingPositions, this.notDraggingPositions, this.oldRules);
        }
        this.draw();
    }

    // Function to remove all positions from the lineup
    clearPositions() {
        this.canvas.removeEventListener('mousedown', this.mdref);
        this.canvas.removeEventListener('mousemove', this.mmref);
        this.canvas.removeEventListener('mouseup', this.muref);
        this.positions.forEach(pos => {
            // Remove event listeners
            //this.canvas.removeEventListener('mousedown', pos.onMouseDown);
            //this.canvas.removeEventListener('mousemove', pos.onMouseMove);
            //this.canvas.removeEventListener('mouseup', pos.onMouseUp);
            pos.removeEventListeners();
        });

        this.positions = []; // Clear the positions array
    }

    getPositions(shirtnums, symbols,lucontext) {
        var positions = []// [new Position(1),new Position(2),new Position(3),new Position(4),new Position(5),new Position(6),];
        var pos = 1;
        shirtnums.forEach(shirtnum => {
            console.log("pos:", pos)
            console.log("shirtnum:", shirtnum)
            var symbol = symbols[shirtnums.indexOf(shirtnum)]
            var updatedposition = new Position(pos, shirtnum,symbol,lucontext)
            positions.push(updatedposition);
            console.log("assigned shirtnum ",shirtnum, " to position ",pos," successfully")
            pos ++;
        })
        console.log("assigned all shirtnums to lineup successfully");
        console.log("these are the positions");
        positions.forEach(pos => {
            console.log(pos);
        })

        return positions
    }

    rotateForward(n=1) {
        //this.prevpositions = this.positions;
        this.clearPositions();
        this.shirtnums = arrayRotateN(this.shirtnums, false,n);
        this.symbols = arrayRotateN(this.symbols, false,n);
        this.positions = this.getPositions(this.shirtnums, this.symbols, this.context);
        //this.addPosListeners();
        this.addEventListeners();
        //this.updatePrevpos(n);
        logmyobject("lineup positions after rotate forward",this.positions);
        logmyobject("previous lineup positions after rotate forward",this.prevpositions);
        counterdebugillegalposition = 0;
    }

    rotateBackward(n=1) {
        //this.prevpositions = this.positions;
        this.clearPositions();
        this.shirtnums = arrayRotateN(this.shirtnums, true,n);
        this.symbols = arrayRotateN(this.symbols, true,n);
        this.positions = this.getPositions(this.shirtnums, this.symbols, this.context);
        //this.addPosListeners();
        this.addEventListeners();
        //this.updatePrevpos(n, false);
        logmyobject("lineup positions after rotate backward",this.positions);
        logmyobject("previous lineup positions after rotate backward",this.prevpositions);
        counterdebugillegalposition = 0;
    }

    isMoving() {
        var output = true;
        this.positions.forEach( pos => {
            output = output & pos.isMoving;
        })
        return output
    }

    updatePrevpos(n=1, forward = true) {
        this.positions.forEach((pos,index) => {
            logmyobject("in updatePrevpos, index",index);
            logmyobject("in updatePrevpos, n",n);
            logmyobject("in updatePrevpos, forward",forward);
            var previndex = (index +n) % 6
            if (!forward) {
                previndex = (index + 5 +n) % 6;
            }
            logmyobject("in updatePrevpos, previndex",previndex);
            var prevpos = this.prevpositions[previndex ];
            logmyobject("pos before updating prevpos",pos);
            pos.prevxpos = prevpos.xpos;
            pos.prevypos = prevpos.ypos;
            logmyobject("pos after updating prevpos",pos);
            logmyobject("prevpos",prevpos);
        })
    }

    movePositions() {

        while (this.isMoving()) {
            this.positions.forEach( pos => {
                pos.moveTowards()
            })
        }
    }

    addPosToPosArray(pos, posarray) {
        if (!posarray.includes(pos)) {
            posarray.push(pos);
        }  
        return posarray
    }

    removePosFromPosArray(pos,posarray) {
        return this.removePositionsByValue(pos.value,posarray);
    }

    removePositionsByValue(value,positions) {
        var result = positions.filter(obj => {
            return obj.value !== value
          })
        return result
    }

    checkPositionsLegalityStatic(checkedpositions = this.positions, otherPositions = this.positions, oldrules = this.oldRules) { 
        checkedpositions.forEach( pos1 => {
            console.log("outer loop considering pos",pos1)
            otherPositions.forEach( pos2 => {
                console.log("inner loop considering pos",pos2)
                if (!this.checkSinglePositionLegality(pos1,pos2,oldrules)) {
                    console.log("illegal")
                    this.addPosTupleToArray(pos1,pos2, this.illegalPositionTuples)    
                } else {
                    console.log("legal")
                    this.removePosTupleFromArray(pos1,pos2,this.illegalPositionTuples)
                }
            })
        })

        
        var notIllegalPositions = this.positions;
        this.illegalPositionTuples.forEach( postuple =>{
            console.log("turning red!")
            var pos1 = postuple[0];
            var pos2 = postuple[1];
            pos1.color = "red";
            pos2.color = "red";
            notIllegalPositions = this.removePosFromPosArray(pos1,notIllegalPositions)
            notIllegalPositions = this.removePosFromPosArray(pos2,notIllegalPositions)
        })
        notIllegalPositions.forEach( pos =>{
            console.log("turning green position ", pos.symbol)
            pos.color = "green";
        })

        if (this.illegalPositionTuples.length > 0) {
            logmyobject("this.illegalPositionTuples",this.illegalPositionTuples)
        }

    }

    addPosTupleToArray(mypos1, mypos2, postuplearray) {
        var postuple = [mypos1,mypos2];
        var found = false;
        for (let i = 0; i < postuplearray.length; i++) {
            const tuple = postuplearray[i];
            const pos1 = tuple[0];
            const pos2 = tuple[1];
            if ((mypos1.value == pos1.value && mypos2.value == pos2.value ) | (mypos1.value == pos2.value && mypos2.value == pos1.value)) {
                found = true;
                break;
            }
        }
        if (!found) {
            postuplearray.push(postuple);
        }
        
    }

    removePosTupleFromArray(mypos1, mypos2, postuplearray) {
        for (let i = 0; i < postuplearray.length; i++) {
            const tuple = postuplearray[i];
            const pos1 = tuple[0];
            const pos2 = tuple[1];
            if ((mypos1.value == pos1.value && mypos2.value == pos2.value ) | (mypos1.value == pos2.value && mypos2.value == pos1.value)) {
                postuplearray.splice(i, 1); // Remove the tuple at index i
                return true; // Tuple removed successfully
            }
        }
        return false; // Tuple not found in the array
    }

    checkPositionsLegality(checkedpositions = this.positions, otherPositions = this.positions) { 
        var posillegal = false;
        checkedpositions.forEach( pos1 => {
            otherPositions.forEach( pos2 => {
                if (!this.checkSinglePositionLegality(pos1,pos2)) {
                    posillegal = true;
                    pos1.color = "red";
                    pos2.color = "red";

                    if (!this.illegalPositions.includes(pos1)) {
                        this.newIllegalPositions = this.addPosToPosArray(pos1, this.newIllegalPositions)
                    }   
                    this.illegalPositions = this.addPosToPosArray(pos1, this.illegalPositions)
                    this.removePositionsByValue(pos1.value,this.notIllegalPositions);

                    if (!this.illegalPositions.includes(pos2)) {
                        this.newIllegalPositions = this.addPosToPosArray(pos2, this.newIllegalPositions)
                    }   
                    this.illegalPositions = this.addPosToPosArray(pos2, this.illegalPositions)
                    this.removePositionsByValue(pos2.value,this.notIllegalPositions);
                } 
                else {
                    if (this.newIllegalPositions.includes(pos1)) {
                        pos1.color = "green"
                        this.newIllegalPositions = this.removePositionsByValue(pos1.value,this.newIllegalPositions);
                    }
                    if (this.newIllegalPositions.includes(pos2)) {
                        pos2.color = "green"
                        this.newIllegalPositions = this.removePositionsByValue(pos2.value,this.newIllegalPositions);
                    }
                }
            })
        })
    }

    checkPositionsLegalityOLD(checkedpositions = this.positions, otherPositions = this.positions) { 
        console.log("checking positions legality!!!")
        checkedpositions.forEach( (pos1,index1) => {
            var pos1illegal = false;
            otherPositions.forEach( (pos2,index2) => {
                if (!this.checkSinglePositionLegality(pos1,pos2)) {
                    pos1illegal = true;
                    pos1.color = "red";
                    pos2.color = "red";

                    if (!this.newIllegalPositions.includes(pos1) & !this.illegalPositions.includes(pos1)) {
                        console.log("Hey yall trying to assign value  to newIllegalpositions at index",index1)
                        //this.newIllegalPositions[index1] = pos1;
                        this.newIllegalPositions.push(pos1);
                        console.log("Hey yall i just pushed to this.newIllegalPositions")
                    }   

                    if (!this.illegalPositions.includes(pos1)) {
                        console.log("Hey yall trying to assign value  to illegalpositions at index",index1)
                        //this.illegalPositions[index1] = pos1;
                        this.illegalPositions.push(pos1);
                        this.removePositionsByValue(pos1.value,this.notIllegalPositions);
                        console.log("Hey yall i just pushed to this.illegalPositions");
                    }          

                    if (!this.newIllegalPositions.includes(pos2) & !this.illegalPositions.includes(pos2)) {
                        console.log("Hey yall trying to assign value  to newIllegalpositions at index",index2)
                        //this.newIllegalPositions[index2] = pos2;
                        this.newIllegalPositions.push(pos2);
                        console.log("Hey yall i just pushed to this.newIllegalPositions")
                    }  

                    if (!this.illegalPositions.includes(pos2)) {
                        console.log("Hey yall trying to assign value  to illegalpositions at index",index1)
                        //this.illegalPositions[index2] = pos2;
                        this.illegalPositions.push(pos2);
                        this.removePositionsByValue(pos2.value,this.notIllegalPositions);
                        console.log("Hey yall i just pushed to this.illegalPositions")
                    }          
                 
                    console.log("illegal position!!!")
                    logmyobject("pos1 which is illegal with pos2",pos1.symbol);
                    logmyobject("pos2 which is illegal with pos1",pos2.symbol);
                    console.log("number of elements in newIllegalPositions: ", this.newIllegalPositions.length)
                    this.newIllegalPositions.forEach( (pos2,index2) => {
                        console.log(pos2.symbol, " at position ", index2)
                    }
                    )
                    console.log
                    console.log("number of elements in illegalPositions: ", this.illegalPositions.length)
                    this.illegalPositions.forEach( (pos2,index2) => {
                        console.log(pos2.symbol, " at position ", index2)
                    }
                    )
                } 
            })
            if (!pos1illegal) {
                //logmyobject("all positions legal for",pos1.symbol)
                pos1.color = "green";
                //console.log("number of elements in newIllegalPositions: ", this.newIllegalPositions.length)
                //remove element from illegalpositions

                if (this.illegalPositions.includes(pos1)) {
                    console.log("***")
                    console.log(pos1.symbol, " is no longer illegal, removing from illegalPositions")
                    console.log("BEFORE number of elements in illegalPositions: ", this.illegalPositions.length)
                    this.illegalPositions = this.removePositionsByValue(pos1.value,this.illegalPositions);
                    

                    console.log("AFTER number of elements in ollegalPositions: ", this.illegalPositions.length)
                    console.log("number of elements in illegalPositions: ", this.illegalPositions.length)
                    this.illegalPositions.forEach( (pos2,index2) => {
                        console.log(pos2.symbol, " at position ", index2)
                    })
                    console.log("***")
                }
                if (this.newIllegalPositions.includes(pos1)) {
                    this.newIllegalPositions = this.removePositionsByValue(pos1.value,this.newIllegalPositions);
                }
                
            }
        })
    }

    getPositionWithRelationship(pos) {
        var posvalues = []
        if (pos.value == 1) posvalues = [1,5,6]
        if (pos.value == 2) posvalues = [1,3,4]
        if (pos.value == 3) posvalues = [2,4,6]
        if (pos.value == 4) posvalues = [2,3,5]
        if (pos.value == 5) posvalues = [1,4,6]
        if (pos.value == 6) posvalues = [1,3,5]
        var positionswithrel = getPositionFromValue(posvalues,this.positions) 
        return positionswithrel
    }

    checkSinglePositionLegality(pos1,pos2, oldrules = false) {
        if (oldrules) {
            return this.checkSinglePositionLegalityOldRules(pos1,pos2)
        } else {
            return this.checkSinglePositionLegalityNewRules(pos1,pos2)
        }
    }

    checkSinglePositionLegalityOldRules(pos1,pos2) {
        //vertical legality
        var vertlegal = true;
        if (pos1.hor == pos2.hor) {
            var fp = pos1;
            var bp = pos2;
            if (pos1.isbackrow) {
                var fp = pos2;
                var bp = pos1;
            }
            var bp_frontfeet_pos = bp.ypos - 0.5 * bp.height;
            var fp_frontfeet_pos = fp.ypos - 0.5* fp.height;
            //logmyobject("bp_backfeet_pos",bp_backfeet_pos);
            //logmyobject("fp_frontfeet_pos",fp_frontfeet_pos);
            //logmyobject("vertlegal",vertlegal);
            vertlegal = bp_frontfeet_pos >= fp_frontfeet_pos;
        } 
        //horizontal legality
        var horlegal = true;
        if (pos1.vert == pos2.vert) {
            var lp = pos1;
            var rp = pos2;
            if (pos1.hor > pos2.hor) {
                var lp = pos2;
                var rp = pos1;
            } 
            var lp_rightfeet_pos = lp.xpos + 0.5 * lp.width;
            var rp_rightfeet_pos = rp.xpos + 0.5 * rp.width;
            horlegal = lp_rightfeet_pos <= rp_rightfeet_pos;
        } 
        var output = vertlegal & horlegal;
        if (!output) {
            counterdebugillegalposition ++;
            if (counterdebugillegalposition == 1) {
                for (let step = 0; step < 100; step++) {
                    console.log("***")
                    console.log("SPECIAL DEBUG LOG")
                }
                logmyobject("pos1",pos1)
                logmyobject("pos2",pos2)
                logmyobject("bp_backfeet_pos",bp_backfeet_pos);
                logmyobject("fp_frontfeet_pos",fp_frontfeet_pos);
                logmyobject("vertlegal",vertlegal);
                logmyobject("lp_leftfeet_pos",lp_leftfeet_pos);
                logmyobject("rp_rightfeet_pos",rp_rightfeet_pos);
                logmyobject("horlegal",horlegal);

                logmyobject("this.draggingPositions",this.draggingPositions);
                logmyobject("this.notDraggingPositions",this.notDraggingPositions);
                logmyobject("this.positions",this.positions);

                for (let step = 0; step < 100; step++) {
                    console.log("SPECIAL DEBUG LOG")
                    console.log("***")
                }
            }
        }
        //logmyobject("output",output);

        return output 
    }



    checkSinglePositionLegalityNewRules(pos1,pos2) {
        //vertical legality
        var vertlegal = true;
        if (pos1.hor == pos2.hor) {
            var fp = pos1;
            var bp = pos2;
            if (pos1.isbackrow) {
                var fp = pos2;
                var bp = pos1;
            }
            var bp_backfeet_pos = bp.ypos + 0.5 * bp.height;
            var fp_frontfeet_pos = fp.ypos - 0.5* fp.height;
            //logmyobject("bp_backfeet_pos",bp_backfeet_pos);
            //logmyobject("fp_frontfeet_pos",fp_frontfeet_pos);
            //logmyobject("vertlegal",vertlegal);
            vertlegal = bp_backfeet_pos > fp_frontfeet_pos;
        } 
        //horizontal legality
        var horlegal = true;
        if (pos1.vert == pos2.vert) {

            var lp = pos1;
            var rp = pos2;
            if (pos1.hor > pos2.hor) {
                var lp = pos2;
                var rp = pos1;
            } 
            var lp_leftfeet_pos = lp.xpos - 0.5 * lp.width;
            var rp_rightfeet_pos = rp.xpos + 0.5 * rp.width;
            //logmyobject("lp_leftfeet_pos",lp_leftfeet_pos);
            //logmyobject("rp_rightfeet_pos",rp_rightfeet_pos);
            horlegal = lp_leftfeet_pos < rp_rightfeet_pos;
            //logmyobject("horlegal",horlegal);
        } 
        var output = vertlegal & horlegal;
        if (!output) {
            counterdebugillegalposition ++;
            if (counterdebugillegalposition == 1) {
                for (let step = 0; step < 100; step++) {
                    console.log("***")
                    console.log("SPECIAL DEBUG LOG")
                }
                logmyobject("pos1",pos1)
                logmyobject("pos2",pos2)
                logmyobject("bp_backfeet_pos",bp_backfeet_pos);
                logmyobject("fp_frontfeet_pos",fp_frontfeet_pos);
                logmyobject("vertlegal",vertlegal);
                logmyobject("lp_leftfeet_pos",lp_leftfeet_pos);
                logmyobject("rp_rightfeet_pos",rp_rightfeet_pos);
                logmyobject("horlegal",horlegal);

                logmyobject("this.draggingPositions",this.draggingPositions);
                logmyobject("this.notDraggingPositions",this.notDraggingPositions);
                logmyobject("this.positions",this.positions);

                for (let step = 0; step < 100; step++) {
                    console.log("SPECIAL DEBUG LOG")
                    console.log("***")
                }
            }
        }
        //logmyobject("output",output);

        return output 
    }

    draw() {
        this.context.clearRect(0, 0, window_width , window_height)
        drawcourt();
        this.positions.forEach( pos => {
            pos.draw();
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

function logmyobject(desc ="myobj",myobj) {
    console.log(desc + ": ");
    console.dir(myobj);
}

class Position {
    constructor(value, shirtnum, symbol = "P",poscontext) {

        if(!([1,2,3,4,5,6].includes(value))) {
            throw('value can only take any of the following values: [1,2,3,4,5,6], but value attempt was: '+ value.toString() );
        }

        this.value = value;
        this.shirtnum = shirtnum;
        this.symbol = symbol;

        this.width = 0.1*window_width;
        this.height = 0.1*window_height;

        this.color = "green";

        this.speed = 50;


        this.context = poscontext;
        this.canvas = this.context.canvas;


        this.isfrontrow = ([2,3,4].includes(value));
        this.isbackrow = ([5,6,1].includes(value));
        this.isleftside = ([4,5].includes(value));
        this.ismiddle = ([3,6].includes(value));
        this.isrightside = ([1,2].includes(value));

        if (this.isfrontrow) {
            this.vert = 1;
        }
        if (this.isbackrow) {
            this.vert = 0;
        }
        if (this.isleftside) {
            this.hor = 0;
        }
        if (this.ismiddle) {
            this.hor = 1;
        }
        if (this.isrightside) {
            this.hor = 2;
        }

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

        this.prevxpos = this.xpos;
        this.prevypos = this.ypos;

        this.isMoving = false;
        this.currentmovestep = 0;

        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.mdref = this.onMouseDown.bind(this);
        this.muref = this.onMouseUp.bind(this);
        this.mmref = this.onMouseMove.bind(this);

        this.addEventListeners();

    }

    addEventListeners() {
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.mdref);
        this.canvas.addEventListener('mousemove', this.mmref);
        this.canvas.addEventListener('mouseup', this.muref);
    }

    removeEventListeners() {
        this.canvas.removeEventListener('mousedown', this.mdref);
        this.canvas.removeEventListener('mousemove', this.mmref);
        this.canvas.removeEventListener('mouseup', this.muref);
    }

    prevposition() {
        var allvalues = [1,2,3,4,5,6]
        var currindex = allvalues.indexOf(this.value)
        var previndex = (currindex +1) % 6
        return allvalues[previndex]
    }
 
    moveFrom() {

        //var tolerance = 0.5
        //var is_move_over = (isCloseEnough(this.xpos,fromxpos,tolerance) && isCloseEnough(this.ypos,fromypos,tolerance));

        logmyobject("inside modeTowards, current object",this);

        var nbsteps = 1/this.speed;

        console.log("nbsteps:",nbsteps);
        console.log("prevxpos:",this.prevxpos);
        console.log("prevypos:",this.prevypos);
        console.log("this.currentmovestep:",this.currentmovestep);

        this.isMoving =  (this.currentmovestep < nbsteps); // 

        console.log("is_move_over:",is_move_over);

        const dx = Math.abs(this.prevxpos-this.xpos) / nbsteps;
        const dy = Math.abs(this.prevypos-this.ypos) / nbsteps;


        if (!this.isMoving) {
            this.xpos += dx ;
            this.ypos += dy ;
            this.draw()
            this.currentmovestep  ++ ;
        } else {
          this.currentmovestep = 0;
          this.prevxpos = this.xpos;
          this.prevypos = this.ypos;
        }

        return this.isMoving
    }

    draw() {
        var poscontext = this.context;
        poscontext.save(); // Save the current canvas state
    
        poscontext.beginPath();
        poscontext.strokeStyle = this.color;
        poscontext.lineWidth = 3;
    
        // Rotate the canvas around the Position instance's coordinates
        poscontext.translate(this.xpos, this.ypos);
        poscontext.rotate(-total_angle); // Replace 'this.rotationAngle' with the desired rotation angle in radians
    
        // Shirtnumber
        poscontext.textAlign = "center";
        poscontext.textBaseline = "middle"
        poscontext.font = "bold 20px Arial";
        poscontext.fillText(this.shirtnum, 0, 0); // Text position relative to the Position instance's coordinates
    
        // Symbol
        poscontext.textAlign = "left";
        poscontext.textBaseline = "bottom"
        poscontext.font = "15px Arial";
        poscontext.fillText(this.symbol, -0.45 * this.width, 0.45 * this.height); // Text position relative to the Position instance's coordinates
    
        // Value
        poscontext.textAlign = "right";
        poscontext.textBaseline = "bottom"
        poscontext.font = "15px Arial";
        poscontext.fillText(this.value, 0.45 * this.width, 0.45 * this.height); // Text position relative to the Position instance's coordinates
    
        poscontext.rect(
            -0.5 * this.width, // Rectangle position relative to the Position instance's coordinates
            -0.5 * this.height,
            this.width,
            this.height
        );
        poscontext.stroke();
        poscontext.closePath();
    
        poscontext.restore(); // Restore the canvas state
    }

    drawOLD() {
        var poscontext = this.context;
        poscontext.beginPath();
        poscontext.strokeStyle = this.color;
        poscontext.lineWidth = 3;

        //shirtnumber
        poscontext.textAlign = "center";
        poscontext.textBaseline = "middle"
        poscontext.font = "bold 20px Arial";
        poscontext.weit
        poscontext.fillText(this.shirtnum, this.xpos, this.ypos);

        //symbol
        poscontext.textAlign = "left";
        poscontext.textBaseline = "bottom"
        poscontext.font = "15px Arial";
        poscontext.fillText(this.symbol, this.xpos-0.45*this.width, this.ypos+0.45*this.height);

        //value
        poscontext.textAlign = "right";
        poscontext.textBaseline = "bottom"
        poscontext.font = "15px Arial";
        poscontext.fillText(this.value, this.xpos + 0.45*this.width, this.ypos+0.45*this.height);

        poscontext.rect(
            this.xpos - 0.5*this.width,
            this.ypos - 0.5*this.height,
            this.width,
            this.height
            );
        poscontext.stroke();
        poscontext.closePath();

    }

    onMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Convert mouse coordinates to rotated canvas coordinates
        const rotatedCoords = convertToRotatedCoords(mouseX, mouseY, total_angle);

        if (
            rotatedCoords.x >= this.xpos - 0.5 * this.width &&
            rotatedCoords.x <= this.xpos + 0.5 * this.width &&
            rotatedCoords.y >= this.ypos - 0.5 * this.height &&
            rotatedCoords.y <= this.ypos + 0.5 * this.height
        ) {
            this.isDragging = true;
            this.dragOffsetX = rotatedCoords.x - this.xpos;
            this.dragOffsetY = rotatedCoords.y - this.ypos;
        }
    }

    onMouseMove(event) {
        if (this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Convert mouse coordinates to rotated canvas coordinates
            const rotatedCoords = convertToRotatedCoords(mouseX, mouseY,total_angle);

            this.xpos = rotatedCoords.x - this.dragOffsetX;
            this.ypos = rotatedCoords.y - this.dragOffsetY;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        }
    }

    onMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;
        }
    }
}

isCloseEnough = function(a,b,tolerance) {
    return Math.abs(a-b) < Math.abs(tolerance)
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

    max_court_width = Math.min(window.innerWidth,window.innerHeight)

    //max_court_width = window.innerWidth;
    
    window_width = 0.80 * max_court_width;
    //window_height = 0.80 * 2 * max_court_width;
    window_height = 0.80 * max_court_width;

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
    mylineup = new Lineup([5,9,45,23,12,7],mysymbols,context);
    mylineup.draw();

    
    document.getElementById('fwd').addEventListener('click',function(){
        //context.clearRect(0, 0, canvas.width, canvas.height)
        mylineup.rotateForward();
        mylineup.draw();
        //animate();
    });
    
    document.getElementById('bck').addEventListener('click',function(){
        //context.clearRect(0, 0, canvas.width, canvas.height)
        mylineup.rotateBackward();
        mylineup.draw();
        //animate();
        
    });

    function rotateCanvas(angle) {
        // Save the current context state
        context.save();
    
        // Translate the canvas to the bottom-left corner
        context.translate(0, canvas.height);
    
        // Rotate the canvas counterclockwise by 90 degrees
        context.rotate(angle);

        mylineup.draw();

        total_angle += angle;
    
        // Draw your objects on the canvas (assuming you have a draw function for each object)
        // Example:
        // object1.draw();
        // object2.draw();
        // ...

        // Restore the context to its original state
        //context.restore();
    }

    // Function to convert mouse coordinates to rotated canvas coordinates
    function convertToRotatedCoords(x, y, rotationAngle) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
    
        // Calculate the angle between the mouse position and the canvas center
        const angle = Math.atan2((y - centerY), x - centerX) ;
    
        // Calculate the distance between the mouse position and the canvas center
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
        // Adjust the angle based on the rotation angle of the canvas
        const adjustedAngle = angle - rotationAngle;
    
        // Calculate the rotated coordinates
        const rotatedX = centerX + distance * Math.cos(adjustedAngle);
        const rotatedY = centerY + distance * Math.sin(adjustedAngle);
    
        return { x: rotatedX, y: rotatedY };
    }
    
    
    let rotate_angle = -Math.PI/ 2;
    var total_angle =0;

    // Call the rotateCanvas function when needed
    // For example, you can call it when a button is clicked
    document.getElementById('rotatecanvas').addEventListener('click', function() {
        rotateCanvas(rotate_angle);
        mylineup.draw();
    });

    const oldrulescheckbox = document.getElementById('oldrules-toggle-checkbox');
    oldrulescheckbox.addEventListener('change',function(){
        mylineup.oldRules = !mylineup.oldRules;
        mylineup.checkPositionsLegalityStatic();
        mylineup.draw();
    });


    /*
    function animate(isOver = false) {
        isOver = mylineup.draw(context);
        if (!isOver) {
            requestAnimationFrame(animate);
        }
    }
    */
    
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
    
    
}





