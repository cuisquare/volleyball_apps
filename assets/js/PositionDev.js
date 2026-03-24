import {logmyobject} from './utils.js';
import {drawPosition} from './CourtRenderer.js';
import {
    addPositionEventListeners,
    removePositionEventListeners,
    isInsideBox as controllerIsInsideBox,
    isInsideShirtNum as controllerIsInsideShirtNum,
    isInsideSymbol as controllerIsInsideSymbol,
    isInsidePositionValue as controllerIsInsidePositionValue,
    isInsidePosition as controllerIsInsidePosition,
    onPositionTouchStart,
    onPositionMouseDown,
    onPositionTouchMove,
    onPositionMouseMove,
    onPositionTouchEnd,
    onPositionMouseUp,
    onPositionMouseRightClick
} from './LineupInteractionController.js';


class PositionDev {
    constructor(
        value, 
        shirtnum, 
        symbol = "P",
        poscontext,
        total_angle = 0,
        playerappearance,
        xpos = "default",
        ypos = "default",
        courtwidth,
        courtheight,
        imageSrcGreen =  "../assets/images/squarefeetgreyernobackgroundgreen.png",
        imageSrcRed =  "../assets/images/squarefeetgreyernobackgroundred.png"
        ) {

        if(!([1,2,3,4,5,6].includes(value))) {
            throw('value can only take any of the following values: [1,2,3,4,5,6], but value attempt was: '+ value.toString() );
        }

        this.value = value;
        this.shirtnum = shirtnum;
        this.symbol = symbol;

        this.postocourtratio = 0.1;
        this.courtwidth = courtwidth;
        this.courtheight = courtheight;

/*         this.width = 0.1*window_width;
        this.height = 0.1*window_height;  */

        this.total_angle = total_angle;

        this.colorbackground = "#eee";

        this.color = "green";

        this.backgroundImageGreen = null;
        if (imageSrcGreen) {
            this.backgroundImageGreen = new Image();
            this.backgroundImageGreen.src = imageSrcGreen;

            // Ensure image is loaded before drawing
            this.backgroundImageGreen.onload = () => {
                this.draw();
            };

            this.backgroundImage= this.backgroundImageGreen;
        }
        this.backgroundImageRed = null;
        if (imageSrcRed) {
            this.backgroundImageRed = new Image();
            this.backgroundImageRed.src = imageSrcRed;

            // Ensure image is loaded before drawing
            this.backgroundImageRed.onload = () => {
                this.draw();
            };
        }

        this.editPlayerAppearance(playerappearance);



        this.independentEdit = false;

        this.speed = 50;


        this.context = poscontext;
        /* this.canvas = this.context.canvas; */

        this.assignLaterality();

        this._courtX = 0;
        this._courtY = 0;
        this._prevCourtX = 0;
        this._prevCourtY = 0;

        let initialY = ypos;
        if (ypos == "default") {
            if (this.isfrontrow) {
                initialY = 0.5 * this.courtheight / 3.0;
            }
            if (this.isbackrow) {
                initialY = 0.666 * this.courtheight;
            }
        }

        let initialX = xpos;
        if (xpos == "default") {
            if (this.isleftside) {
                initialX = 0.25 * this.courtwidth;
            }
            if (this.ismiddle) {
                initialX = 0.5 * this.courtwidth;
            }
            if (this.isrightside) {
                initialX = 0.75 * this.courtwidth;
            }
        }

        this.xpos = initialX;
        this.ypos = initialY;
        this.prevxpos = this.xpos;
        this.prevypos = this.ypos;

        this.isMoving = false;
        this.currentmovestep = 0;

        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.touchStartTime = null;
        // Get touch end time
        this.touchEndTime = null;

        // Calculate touch duration
        this.touchDuration = null;

        this.mdref = this.onMouseDown.bind(this);
        this.muref = this.onMouseUp.bind(this);
        this.mmref = this.onMouseMove.bind(this);
        //this.mrcref = this.onMouseRightClick.bind(this);

        this.tsref = this.onTouchStart.bind(this);
        this.teref = this.onTouchEnd.bind(this);
        this.tmref = this.onTouchMove.bind(this);

        this.addEventListeners();

    }

    get canvas() {
        return(this.getCanvas())
    }

    set canvas(mycanvas) {
        this.context.canvas = mycanvas;
    }

    getCanvas() {
        return(this.context.canvas)
    }

    get rotationPosition() {
        return this.value;
    }

    set rotationPosition(newRotationPosition) {
        this.value = newRotationPosition;
    }

    get xpos() {
        return this._courtX * this.courtwidth;
    }

    set xpos(newXPos) {
        if (this.courtwidth === 0) {
            this._courtX = 0;
            return;
        }
        this._courtX = newXPos / this.courtwidth;
    }

    get ypos() {
        return this._courtY * this.courtheight;
    }

    set ypos(newYPos) {
        if (this.courtheight === 0) {
            this._courtY = 0;
            return;
        }
        this._courtY = newYPos / this.courtheight;
    }

    get prevxpos() {
        return this._prevCourtX * this.courtwidth;
    }

    set prevxpos(newPrevXPos) {
        if (this.courtwidth === 0) {
            this._prevCourtX = 0;
            return;
        }
        this._prevCourtX = newPrevXPos / this.courtwidth;
    }

    get prevypos() {
        return this._prevCourtY * this.courtheight;
    }

    set prevypos(newPrevYPos) {
        if (this.courtheight === 0) {
            this._prevCourtY = 0;
            return;
        }
        this._prevCourtY = newPrevYPos / this.courtheight;
    }

    get courtX() {
        return this._courtX;
    }

    set courtX(newCourtX) {
        this._courtX = newCourtX;
    }

    get courtY() {
        return this._courtY;
    }

    set courtY(newCourtY) {
        this._courtY = newCourtY;
    }

    get prevCourtX() {
        return this._prevCourtX;
    }

    set prevCourtX(newPrevCourtX) {
        this._prevCourtX = newPrevCourtX;
    }

    get prevCourtY() {
        return this._prevCourtY;
    }

    set prevCourtY(newPrevCourtY) {
        this._prevCourtY = newPrevCourtY;
    }

    get width() {
        return (this.getPosWidth())
    }

    getPosWidth() {
        return(this.postocourtratio * this.courtwidth)
    }

    get height() {
       return (this.getPosHeight())
    }

    getPosHeight() {
        return(this.postocourtratio * this.courtheight)
    }

    assignLaterality() {
        this.isfrontrow = ([2,3,4].includes(this.rotationPosition));
        this.isbackrow = ([5,6,1].includes(this.rotationPosition));
        this.isleftside = ([4,5].includes(this.rotationPosition));
        this.ismiddle = ([3,6].includes(this.rotationPosition));
        this.isrightside = ([1,2].includes(this.rotationPosition));

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
    }

    prevposition() {
        var allvalues = [1,2,3,4,5,6]
        var currindex = allvalues.indexOf(this.rotationPosition)
        var previndex = (currindex +1) % 6
        return allvalues[previndex]
    }
 
    editShirtNum(currentShirtNums,fullShirtNums, mode = "override") {
        // Display a form or dialog box to edit shirtnum property 
        console.log("currentShirtNums: ",currentShirtNums)
        console.log("fullShirtNums: ",fullShirtNums)
        const newShirtNum = prompt("Enter new shirt number.", this.shirtnum);
        //TODO change so that editing to an existing shirt number swaps number 
        //TODO this can only be done at the lineup class level because the present
        //class does not have access to the other position objects

        if ((newShirtNum !== null )) {
            if (mode == "ingame") {
                console.log("mode == ingame in editShirtNum")
                if (!(currentShirtNums.includes(parseInt(newShirtNum)))) {
                    if (fullShirtNums.includes(parseInt(newShirtNum))) {
                        this.shirtnum = parseInt(newShirtNum);
                    }
                }  
            }
            if (mode == "override") {
                console.log("mode == override in editShirtNum")
                this.shirtnum = parseInt(newShirtNum);
            }
        }
    }

    editSymbol(allowedSymbols) {
        // Display a form or dialog box to edit shirtnum property 
        const newSymbol = prompt("Enter new symbol:", this.symbol);
        if (newSymbol !== null) {
            if (allowedSymbols.includes(newSymbol)) {
                this.symbol = newSymbol;
            }
        }
    }

    editPosition() {
        // Display a form or dialog box to edit properties of 'pos'
        // For example:
        const newShirtNum = prompt("Enter new shirt number:", this.shirtnum);
        if (newShirtNum !== null) {
            this.shirtnum = newShirtNum;
        }

        const newValue = prompt("Enter new position value (1-6 only):", this.rotationPosition);
        if (newValue !== null) {
            this.rotationPosition = newValue;
        }


        // Repeat this process for other properties if needed
    }

    editPlayerAppearance(playerappearance) {
        this.playerappearance = playerappearance;
        this.drawfeet = true;
        this.drawsquare = true; 
        if (this.playerappearance == "feet") {
            this.drawsquare = false;
        }
        if (this.playerappearance == "square") {
            this.drawfeet = false;
        }
    }

    addEventListeners() {
        addPositionEventListeners(this);
    }

    removeEventListeners() {
        removePositionEventListeners(this);
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
        drawPosition(this);
    }

    isInsideBox(x, y,xmin,xmax,ymin,ymax) {     
        return controllerIsInsideBox(this, x, y, xmin, xmax, ymin, ymax);
    }

    isInsideShirtNum(mouseX, mouseY) {
        return controllerIsInsideShirtNum(this, mouseX, mouseY);
    }

    isInsideSymbol(mouseX, mouseY,isUpright,leftcourt) {
        return controllerIsInsideSymbol(this, mouseX, mouseY, isUpright, leftcourt);
    }

    isInsidePositionValue(mouseX, mouseY,isUpright,leftcourt) {
        return controllerIsInsidePositionValue(this, mouseX, mouseY, isUpright, leftcourt);
 }

    assignContext(newcontext) {
        this.context = newcontext;
        //this.canvas = this.context.canvas;
    }

    isInside(x,y) {
        return controllerIsInsidePosition(this, x, y);
    }

    onTouchStart(event) {
        onPositionTouchStart(this, event);
    }

    onMouseDown(event) {
        onPositionMouseDown(this, event);
    }

    onTouchMove(event) {
        onPositionTouchMove(this, event);
    }

    onMouseMove(event) {
        onPositionMouseMove(this, event);
    }

    onTouchEnd(event) {
        onPositionTouchEnd(this, event);
    }

    onMouseUp(event = null) {
        onPositionMouseUp(this, event);
    }


    onMouseRightClick(event) {
        onPositionMouseRightClick(this, event);
    }

 
}

// Export the class to make it accessible in other files
export default PositionDev;
