import {logmyobject} from '../core/utils.js';
import CourtPlayerState from './CourtPlayerState.js';
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

class Position extends CourtPlayerState {
    constructor(
        rotationPosition, 
        shirtnum, 
        symbol = "P",
        poscontext,
        total_angle = 0,
        playerappearance,
        courtX = "default",
        courtY = "default",
        courtwidth,
        courtheight,
        imageSrcGreen =  "../assets/images/squarefeetgreyernobackgroundgreen.png",
        imageSrcRed =  "../assets/images/squarefeetgreyernobackgroundred.png"
        ) {
        super(rotationPosition, shirtnum, symbol);

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

        let initialCourtY = courtY;
        if (courtY == "default") {
            if (this.isfrontrow) {
                initialCourtY = (0.5 * this.courtheight / 3.0) / this.courtheight;
            }
            if (this.isbackrow) {
                initialCourtY = (0.666 * this.courtheight) / this.courtheight;
            }
        }

        let initialCourtX = courtX;
        if (courtX == "default") {
            if (this.isleftside) {
                initialCourtX = (0.25 * this.courtwidth) / this.courtwidth;
            }
            if (this.ismiddle) {
                initialCourtX = (0.5 * this.courtwidth) / this.courtwidth;
            }
            if (this.isrightside) {
                initialCourtX = (0.75 * this.courtwidth) / this.courtwidth;
            }
        }

        this.courtX = initialCourtX;
        this.courtY = initialCourtY;
        this.prevCourtX = this.courtX;
        this.prevCourtY = this.courtY;

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
export default Position;
