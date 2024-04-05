import {logmyobject, arrayRotateN} from './utils.js';

import Position from './Position.js';

class Lineup {
    constructor(
        shirtnums = [15,16,17,18,19,20], 
        symbols = [], 
        lucontext, 
        total_angle, 
        leftcourt,
        window_width, 
        window_height
        ) {

        this.colorcourtline = "#eee";
        this.colorcourtbackground = "#fe7a58";

        this.shirtnums = shirtnums;

        this.defaultsymbols = ["S","O1","M1","Opp","O2","M2"];

        if (this.symbols == []) {
            this.symbols = this.defaultsymbols;
        } else {
            this.symbols = symbols;
        }
        
        this.fullshirtnums = this.shirtnums.slice()

        this.oldRules = false;

        this.context = lucontext;
        this.canvas = this.context.canvas;
        this.total_angle = total_angle;

        this.leftcourt = leftcourt;

        this.isUpright = true;

        this.rotate_angle = -Math.PI / 2

        if (this.leftcourt) {
            this.sideway_total_angle = -3 * Math.PI / 2 
        } else {
            this.sideway_total_angle = Math.PI / 2
        }

        this.courtxpos = 0;
        this.courtypos = 0;

        this.courtwidth = window_width;
        this.courtheight = window_height;

        this.positions = this.getPositions(shirtnums, symbols,this.context, this.total_angle);
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

        this.touchStartTime = null;
            // Get touch end time
        this.touchEndTime = null;

        // Calculate touch duration
        this.touchDuration = null;

        this.isDragging = false;
        this.draggingPositions = [];
        this.notDraggingPositions = this.positions;

        this.mdref = this.onMouseDown.bind(this);
        this.muref = this.onMouseUp.bind(this);
        this.mmref = this.onMouseMove.bind(this);
        this.mlref = this.onMouseLeave.bind(this);
        this.mrcref = this.onMouseRightClick.bind(this);
        this.tsref = this.onTouchStart.bind(this);
        this.tmref = this.onTouchMove.bind(this);
        this.teref = this.onTouchEnd.bind(this);

        this.addEventListeners();

    }

    addShirtnum(newShirtNum) {
        if (!this.fullshirtnums.includes(newShirtNum)) {
            this.fullshirtnums.push(newShirtNum)
        }
    }


    addEventListeners() {
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.mdref);
        this.canvas.addEventListener('mousemove', this.mmref);
        this.canvas.addEventListener('mouseup', this.muref);
        this.canvas.addEventListener('mouseleave', this.mlref);
        this.canvas.addEventListener('contextmenu',this.mrcref);
        this.canvas.addEventListener('touchstart',this.tsref);
        this.canvas.addEventListener('touchmove',this.tmref);
        this.canvas.addEventListener('touchend',this.teref);
    }

    onMouseLeave(event) {
        this.positions.forEach((pos,index) => {
            //logmyobject("BECAUSE OF MOUSE LEAVE, calling mouseup on element index",index)
            pos.onMouseUp(event); // Call onMouseDown for each position
        });        
    }

    onTouchStart(event) {
            // Store touch start time and position
        this.touchStartTime = Date.now();
        this.onMouseDown(event);
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

    onTouchEnd(event) {
        event.preventDefault();
        this.touchEndTime = Date.now();
        this.touchDuration = this.touchEndTime - this.touchStartTime;
            // Determine if it was a tap or a long press based on touch duration
        console.log("Touch duration : ", this.touchDuration);
        if (this.touchDuration < 300) { // Tap (less than 300ms)
            console.log("TAP EVENT")
            this.onMouseUp(event);
            const rect = this.canvas.getBoundingClientRect();
            const touchX = event.changedTouches[0].clientX - rect.left;
            const touchY = event.changedTouches[0].clientY - rect.top;
            this.positions.forEach(pos => {
                if (pos.isInsideShirtNum(touchX,touchY)) {
                    logmyobject("calling touch right click on element ",pos)
                    logmyobject("editing positions with forbiddent values ",this.shirtnums)
    
                    pos.editShirtNum(this.shirtnums, this.fullshirtnums)
                    this.shirtnums = this.getShirtNums(this.positions)
                    //before TODO this does not edit shirtnums array and it must do so!
                }
                if (pos.isInsideSymbol(touchX,touchY, this.isUpright,this.leftcourt)) {
                    //TODO something that would assign all other positions based on this one position
                    //pos.editSymbol(this.defaultsymbols)
                    console.log("moomoo inside symbol of ", pos, "!");
                    console.log("second moomoo inside symbol of ", pos, "!");
                    const newSymbol = prompt("Enter new symbol (valid symbols are: "+ this.defaultsymbols +"):","S", this.symbol);
                    this.assignDefaultSymbols(pos, newSymbol); 
                    console.log("No, really, inside symbol of ", pos, "!");
                }
            });
            this.draw();
        } else { // Long press
            console.log("LONG PRESS EVENT")
        }      
    }

    onMouseUp(event) {
        this.positions.forEach(pos => {
            //logmyobject("calling mouseup on element index",index)
            pos.onMouseUp(event); // Call onMouseUp for each position
        });

        //this.checkPositionsLegalityStatic(this.draggingPositions, this.notDraggingPositions);
        this.isDragging = false;
        this.draggingPositions = [];
        this.newIllegalPositions = [];
        this.notDraggingPositions = this.positions;
        
    }

    onMouseRightClick(event) { 
        event.preventDefault(); // Prevent the default context menu
        // Iterate over your list of Position instances
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        this.positions.forEach(pos => {
            if (pos.isInsideShirtNum(mouseX,mouseY)) {
                logmyobject("calling mouse right click on element ",pos)
                logmyobject("editing positions with forbiddent values ",this.shirtnums)

                pos.editShirtNum(this.shirtnums, this.fullshirtnums)
                this.shirtnums = this.getShirtNums(this.positions)
                //before TODO this does not edit shirtnums array and it must do so!
            }
            if (pos.isInsideSymbol(mouseX,mouseY, this.isUpright,this.leftcourt)) {
                //TODO something that would assign all other positions based on this one position
                //pos.editSymbol(this.defaultsymbols)
                console.log("moomoo inside symbol of ", pos, "!");
                console.log("second moomoo inside symbol of ", pos, "!");
                const newSymbol = prompt("Enter new symbol (valid symbols are: "+ this.defaultsymbols +"):","S", this.symbol);
                this.assignDefaultSymbols(pos, newSymbol); 
                console.log("No, really, inside symbol of ", pos, "!");
            }
        });
        this.draw();
    }

    onTouchMove(event) {
        this.onMouseMove(event);
    }

    onMouseMove(event) {
        //console.log("I redrew because of mouse movement");
        if (this.isDragging) {
            this.checkPositionsLegalityStatic(this.draggingPositions, this.notDraggingPositions, this.oldRules);
            this.draw();
        }
    }



    changeOrientationCanvas() {
        if (this.isUpright) {
            if (this.leftcourt) {
                this.rotateCanvasAntiClockWise()
                this.rotateCanvasAntiClockWise()
                this.rotateCanvasAntiClockWise()
            } else {
                this.rotateCanvasAntiClockWise()
            }
        } else {
            if (this.leftcourt) {
                this.rotateCanvasAntiClockWise()
            } else {
                this.rotateCanvasAntiClockWise()
                this.rotateCanvasAntiClockWise()
                this.rotateCanvasAntiClockWise()
            }
        }
        this.isUpright = !this.isUpright;
    }

    increaseTotalAngle(angle) {
        this.total_angle += angle;

        this.positions.forEach( pos => {
            pos.total_angle = this.total_angle;
        })
    }

    applyTotalAngle(angle) {
        this.total_angle = angle;

        this.positions.forEach( pos => {
            pos.total_angle = this.total_angle;
        })
    }

    rotateCanvasAntiClockWise() {
        this.#rotateCanvas(-Math.PI / 2)
    }

    #rotateCanvas(angle = this.rotate_angle) {
        // Translate the canvas to the bottom-left corner
        this.context.translate(0, canvas.height);
    
        // Rotate the canvas counterclockwise by 90 degrees
        this.context.rotate(angle);

        this.total_angle += angle;

        this.positions.forEach( pos => {
            pos.total_angle = this.total_angle;
        })

    }

    // Function to remove all positions from the lineup
    clearPositions() {
        this.canvas.removeEventListener('mousedown', this.mdref);
        this.canvas.removeEventListener('mousemove', this.mmref);
        this.canvas.removeEventListener('mouseup', this.muref);
        this.canvas.removeEventListener('mouseleave', this.mlref);
        this.canvas.removeEventListener('contextmenu', this.mrcref);
        this.canvas.removeEventListener('touchstart',this.tsref);
        this.canvas.removeEventListener('touchmove',this.tmref);
        this.canvas.removeEventListener('touchend',this.teref);
        this.positions.forEach(pos => {
            pos.removeEventListeners();
        });

        this.positions = []; // Clear the positions array
    }

    getPositions(shirtnums, symbols,lucontext) {
        var positions = []
        var pos = 1;
        shirtnums.forEach(shirtnum => {
            console.log("pos:", pos)
            console.log("shirtnum:", shirtnum)
            var symbol = symbols[shirtnums.indexOf(shirtnum)]
            console.log("creating new position")
            console.log("this.courtwidth:",this.courtwidth)
            console.log("this.courtheight:",this.courtheight)
            var updatedposition = new Position(
                pos, 
                shirtnum,
                symbol,
                lucontext, 
                this.total_angle,
                "default",
                "default",
                this.courtwidth, 
                this.courtheight
                )
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

    getShirtNums(positions) {
        var shirtnums = []
        positions.forEach(pos => {
            shirtnums.push(pos.shirtnum)
        })
        return shirtnums
    }

    updateSymbols(newsymbols) {
        var index = 0;
        console.log("inside updateSymbols")
        this.positions.forEach(pos => {
            console.log("index:",index)
            console.log("newsymbols[index]:",newsymbols[index])           
            pos.symbol = newsymbols[index];
            index ++;
        })
        console.log("reassigned all symbols")
    }

    updatePositions(newshirtnums, newsymbols) {
        this.clearPositions();
        this.shirtnums = newshirtnums;
        this.symbols = newsymbols;
        this.positions = this.getPositions(this.shirtnums, this.symbols, this.context);
        this.addEventListeners();
        //this.updatePrevpos(n);
        logmyobject("lineup positions after rotate forward",this.positions);
        logmyobject("previous lineup positions after rotate forward",this.prevpositions);
    }

    assignDefaultSymbols(pos,newdefaultsymbol = "S",recreatePositions = false) {
        console.log("inside assignDefaultSymbols")
        if (this.defaultsymbols.includes(newdefaultsymbol)) {
            console.log(this.defaultsymbols," includes ", newdefaultsymbol)
            var newsymbols = this.defaultsymbols;
            console.log("before rotating, newsymbols:", newsymbols)            
            var nb_rotations = 0;
            console.log("nb_rotations: ",nb_rotations)
            var posvalue = pos.value;
            console.log("posvalue: ",posvalue)
            console.log("newsymbols[posvalue-1]: ",newsymbols[posvalue-1])
            while (newsymbols[posvalue-1] != newdefaultsymbol) {
                newsymbols = arrayRotateN(newsymbols, false,1);
                nb_rotations ++;
                console.log("nb_rotations: ",nb_rotations)

            }
            console.log("after rotating, newsymbols:", newsymbols)
            this.symbols = newsymbols;
            if (recreatePositions) {
                console.log("recreating positions")
                this.clearPositions();
                this.positions = this.getPositions(this.shirtnums, this.symbols, this.context);
                this.addEventListeners();
            } else {
                console.log("NOT recreating positions")
                this.updateSymbols(newsymbols);
                console.log("let's redraw")
                this.draw();
                console.log("i have redrawn")
            }

            logmyobject("lineup positions after reassigning default symbol",this.positions);
        } else {
            console.log("cannot assign default symbol as ", newdefaultsymbol, " is not a valid default symbol. " )
            console.log("valid default symbols are ", this.defaultsymbols)
        }

    }

    rotateForward(n=1) {
        //this.prevpositions = this.positions;
        this.clearPositions();
        this.shirtnums = arrayRotateN(this.shirtnums, false,n);
        this.symbols = arrayRotateN(this.symbols, false,n);
        this.positions = this.getPositions(this.shirtnums, this.symbols, this.context);
        this.addEventListeners();
        //this.updatePrevpos(n);
        logmyobject("lineup positions after rotate forward",this.positions);
        logmyobject("previous lineup positions after rotate forward",this.prevpositions);
    }

    rotateBackward(n=1) {
        //this.prevpositions = this.positions;
        this.clearPositions();
        this.shirtnums = arrayRotateN(this.shirtnums, true,n);
        this.symbols = arrayRotateN(this.symbols, true,n);
        this.positions = this.getPositions(this.shirtnums, this.symbols, this.context);
        this.addEventListeners();
        //this.updatePrevpos(n, false);
        logmyobject("lineup positions after rotate backward",this.positions);
        logmyobject("previous lineup positions after rotate backward",this.prevpositions);
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
        return output 
    }

    drawcourt = function() {

        //TODO starting making changes that refer to court_width, court_height and
        //also has position for top left corner of court which can be changed

        var lucontext = this.context
        lucontext.beginPath();
        lucontext.strokeStyle = this.colorcourtline;
        lucontext.lineWidth = 8;
        //lucontext.moveTo(0, 0); // Move the pen to (30, 50)
        lucontext.fillStyle = this.colorcourtbackground;
        lucontext.fillRect(0,0,this.courtwidth,this.courtheight);
        lucontext.rect(0,0,this.courtwidth,this.courtheight);
        lucontext.stroke();
        lucontext.lineWidth = 5;
        lucontext.rect(0,0,this.courtwidth,this.courtheight / 3.0);
        lucontext.stroke();
        lucontext.closePath();

        // Draw arrow
        const arrowSize = 0.04*this.courtheight;
        const arrowX = this.courtwidth - arrowSize // Right top corner, 40 pixels from right edge
        const arrowY = 0; // 20 pixels from top edge
        
        lucontext.beginPath();
        lucontext.lineWidth = 1;
        lucontext.moveTo(arrowX, arrowY);
        //lucontext.strokeStyle = "purple"
        lucontext.lineTo(arrowX + arrowSize / 2,  arrowY + arrowSize);
        lucontext.stroke();
        //lucontext.closePath();
        //lucontext.beginPath();
        //lucontext.moveTo(arrowX, arrowY);
        //lucontext.strokeStyle = "orange"
        lucontext.lineTo(arrowX - arrowSize / 2, arrowY + arrowSize);
        lucontext.stroke();
        lucontext.fillStyle = "black";
        lucontext.fill();
        lucontext.closePath();
        lucontext.beginPath();
        lucontext.strokeStyle = "black"
        lucontext.lineWidth = 1;
        lucontext.rect(arrowX-arrowSize/6, arrowY+ arrowSize,arrowSize/3,arrowSize/2)
        lucontext.stroke();
        lucontext.fillStyle = "black";
        lucontext.fill();
        lucontext.closePath();
        /*
        lucontext.beginPath();
        lucontext.lineWidth = 8;
        lucontext.moveTo(arrowX, arrowY+ arrowSize);
        lucontext.lineTo(arrowX,arrowY + 2*arrowSize);
        lucontext.stroke();
        lucontext.closePath();
        */

        //lucontext.closePath();
    }

    draw() {
        this.context.clearRect(0, 0, this.courtwidth , this.courtheight)
        this.drawcourt();
        //TODO draw in a certain order so that the shapes being dragged 
        //are on top
        if (!this.isDragging) {
            this.positions.forEach( pos => {
                pos.draw();
            })
        } else {
            this.notDraggingPositions.forEach( pos => {
                pos.draw();
            })
    
            this.draggingPositions.forEach( pos => {
                pos.draw();
            })
        }



    }



}

// Export the class to make it accessible in other files
export default Lineup;