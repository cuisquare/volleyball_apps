import {logmyobject} from './utils.js';

import {convertToRotatedCoords} from './utils.js';


class Position {
    constructor(
        value, 
        shirtnum, 
        symbol = "P",
        poscontext,
        total_angle = 0,
        xpos = "default",
        ypos = "default",
        window_width,
        window_height
        ) {

        //console.log("position constructor called with following arguments:")
        //console.log("value:", value)
        //console.log("shirtnum:", shirtnum)
        //console.log("symbol:", symbol)
        //console.log("poscontext:", poscontext)
        //console.log("total_angle:", total_angle)
        //console.log("xpos:", xpos)
        //console.log("ypos:", ypos)
        //console.log("window_width:", window_width)
        //console.log("window_height:", window_height)

        if(!([1,2,3,4,5,6].includes(value))) {
            throw('value can only take any of the following values: [1,2,3,4,5,6], but value attempt was: '+ value.toString() );
        }

        this.value = value;
        this.shirtnum = shirtnum;
        this.symbol = symbol;

        this.width = 0.1*window_width;
        this.height = 0.1*window_height; 

        this.total_angle = total_angle;

        this.color = "green";

        this.independentEdit = false;

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

        if (ypos == "default") {
            if (this.isfrontrow) {
                this.ypos = 0.5*window_height/3.0
            } 
            if (this.isbackrow) {
                this.ypos = 0.666*window_height
            }
        }

        if (xpos == "default") {
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

    addEventListeners() {
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.mdref);
        this.canvas.addEventListener('mousemove', this.mmref);
        this.canvas.addEventListener('mouseup', this.muref);
        
        this.canvas.addEventListener('touchstart',this.tsref);
        this.canvas.addEventListener('touchmove',this.tmref);
        this.canvas.addEventListener('touchend',this.teref);
        //this.canvas.addEventListener('contextmenu', this.mrcref);
    }

    removeEventListeners() {
        this.canvas.removeEventListener('mousedown', this.mdref);
        this.canvas.removeEventListener('mousemove', this.mmref);
        this.canvas.removeEventListener('mouseup', this.muref);
        
        this.canvas.removeEventListener('touchstart',this.tsref);
        this.canvas.removeEventListener('touchmove',this.tmref);
        this.canvas.removeEventListener('touchend',this.teref);
        //this.canvas.removeEventListener('contextmenu', this.mrcref);
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
        //console.log("drawing a position")
        var poscontext = this.context;
        poscontext.save(); // Save the current canvas state
    
        poscontext.beginPath();
        poscontext.strokeStyle = this.color;
        poscontext.lineWidth = 3;
    
        // Rotate the canvas around the Position instance's coordinates
        poscontext.translate(this.xpos, this.ypos);
        poscontext.rotate(-this.total_angle); // Replace 'this.rotationAngle' with the desired rotation angle in radians
    
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
    
        //console.log("started drawing rectangle for position")
        //console.log("this.width: ", this.width)
        //console.log("this.height: ", this.height)
        poscontext.rect(
            -0.5 * this.width, // Rectangle position relative to the Position instance's coordinates
            -0.5 * this.height,
            this.width,
            this.height
        );
        poscontext.stroke();
        poscontext.closePath();
        //console.log("finished drawing rectangle for position")
    
        poscontext.restore(); // Restore the canvas state
        //console.log("drawed a position")
    }

    isInsideBox(x, y,xmin,xmax,ymin,ymax) {     
        return x >= xmin &&
               x <= xmax &&
               y >= ymin &&
               y <= ymax;
    }

    isInsideShirtNum(mouseX, mouseY) {
        // Convert mouse coordinates to rotated canvas coordinates
        var centerX = this.canvas.width / 2;
        var centerY = this.canvas.height / 2;
        const rotatedCoords = convertToRotatedCoords(
            mouseX, mouseY, this.total_angle,
            centerX,centerY
            );
        return this.isInsideBox(
            rotatedCoords.x,rotatedCoords.y,
            this.xpos - 0.125 * this.width,
            this.xpos + 0.125 * this.width,
            this.ypos - 0.125 * this.width,
            this.ypos + 0.125 * this.width
            )
    }

    isInsideSymbol(mouseX, mouseY,isUpright,leftcourt) {
        
        //TODO here code a save, then rotation of -total_angle
        //basically it picks the right position considering the rotated position 
        //however this is not where the symbol is because at the time of drawing the letter
        //a rotation of -total_angle had been applied. 
        var centerX = this.canvas.width / 2;
        var centerY = this.canvas.height / 2;
        const rotatedCoords = convertToRotatedCoords(mouseX, mouseY, this.total_angle,centerX,centerY);
        if (isUpright) {
                var isinsidebox = this.isInsideBox(
                    rotatedCoords.x,rotatedCoords.y,
                    this.xpos - 0.5 * this.width,
                    this.xpos - 0.125 * this.width,
                    this.ypos + 0.25 * this.width,
                    this.ypos + 0.5 * this.width
                    )

        } else {
            if (leftcourt) {
                var isinsidebox = this.isInsideBox(
                    rotatedCoords.x,rotatedCoords.y,
                    this.xpos + (0.5 - 0.25) * this.width,
                    this.xpos +  0.5 * this.width,
                    this.ypos + 0.125 * this.width,
                    this.ypos + 0.5 * this.width
                    )
            } else {
                var isinsidebox = this.isInsideBox(
                    rotatedCoords.x,rotatedCoords.y,
                    this.xpos - 0.5 * this.width,
                    this.xpos - 0.25 * this.width,
                    this.ypos - 0.5 * this.width,
                    this.ypos - 0.125 * this.width
                    )
            }
        }

        //poscontext.restore(); // Restore the canvas state

        return isinsidebox;
    }

    isInside(x,y) {
        return this.isInsideBox(
            x,y,
            this.xpos - 0.5 * this.width,
            this.xpos + 0.5 * this.width,
            this.ypos - 0.5 * this.width,
            this.ypos + 0.5 * this.width
            )
    }

    onTouchStart(event) {
        // Store touch start time and position
        this.touchStartTime = Date.now();
        // Get touch end position relative to the canvas
        const rect = this.canvas.getBoundingClientRect();
        const touchStartPositionX = event.changedTouches[0].clientX - rect.left;
        const touchStartPositionY = event.changedTouches[0].clientY - rect.top;

        var centerX = this.canvas.width / 2;
        var centerY = this.canvas.height / 2;
        const rotatedCoords = convertToRotatedCoords(touchStartPositionX, touchStartPositionY, this.total_angle,centerX,centerY);


        if (this.isInside(rotatedCoords.x, rotatedCoords.y)) {
            //console.log("CLICKED INSIDE POSITION SO WE ARE NOW DRAGGING")
            this.isDragging = true;
            this.dragOffsetX = rotatedCoords.x - this.xpos;
            this.dragOffsetY = rotatedCoords.y - this.ypos;
        } else {
            //console.log("CLICKED OUTSIDE POSITION SO DRAGGING NOT CHANGED")
        }
    }

    onMouseDown(event) {
        console.log("MOUSE DOWN EVENT")
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Convert mouse coordinates to rotated canvas coordinates
        var centerX = this.canvas.width / 2;
        var centerY = this.canvas.height / 2;
        const rotatedCoords = convertToRotatedCoords(mouseX, mouseY, this.total_angle,centerX,centerY);

        if (this.isInside(rotatedCoords.x, rotatedCoords.y)) {
            //console.log("CLICKED INSIDE POSITION SO WE ARE NOW DRAGGING")
            this.isDragging = true;
            this.dragOffsetX = rotatedCoords.x - this.xpos;
            this.dragOffsetY = rotatedCoords.y - this.ypos;
        } else {
            //console.log("CLICKED OUTSIDE POSITION SO DRAGGING NOT CHANGED")
        }
    }

    onTouchMove(event) {
        if (this.isDragging) {
            //console.log("MOUSE MOVE WHILE DRAGGING")
            const rect = this.canvas.getBoundingClientRect();
            const touchStartPositionX = event.changedTouches[0].clientX - rect.left;
            const touchStartPositionY = event.changedTouches[0].clientY - rect.top;
    
            var centerX = this.canvas.width / 2;
            var centerY = this.canvas.height / 2;
            const rotatedCoords = convertToRotatedCoords(touchStartPositionX, touchStartPositionY, this.total_angle,centerX,centerY);

            this.xpos = rotatedCoords.x - this.dragOffsetX;
            this.ypos = rotatedCoords.y - this.dragOffsetY;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        } else {
            //console.log("MOUSE MOVE WHILE NOT DRAGGING SO WILL NOT DRAW POSITION")
        }        
    }

    onMouseMove(event) {
        if (this.isDragging) {
            //console.log("MOUSE MOVE WHILE DRAGGING")
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Convert mouse coordinates to rotated canvas coordinates
            var centerX = this.canvas.width / 2;
            var centerY = this.canvas.height / 2;
            const rotatedCoords = convertToRotatedCoords(mouseX, mouseY,this.total_angle,centerX,centerY);

            this.xpos = rotatedCoords.x - this.dragOffsetX;
            this.ypos = rotatedCoords.y - this.dragOffsetY;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        } else {
            //console.log("MOUSE MOVE WHILE NOT DRAGGING SO WILL NOT DRAW POSITION")
        }
    }

    onTouchEnd(event) {
        this.isDragging = false;
        event.preventDefault();
        this.touchEndTime = Date.now();
        this.touchDuration = this.touchEndTime - this.touchStartTime;
            // Determine if it was a tap or a long press based on touch duration
        console.log("Touch duration : ", this.touchDuration);
        if (this.touchDuration < 300) { // Tap (less than 300ms)
            console.log("TAP EVENT")
            this.onMouseUp(event);
            console.log("RUNNING onMouseRightCLick(event)")
            this.onMouseRightClick(event);
        } else { // Long press
            console.log("LONG PRESS EVENT")
            //this.onMouseRightClick(event);
        }   
    }

    onMouseUp(event) {
        this.isDragging = false;
    }


    onMouseRightClick(event) {

        //not called anymore to give more limits to the edit

        if (this.independentEdit) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            //TODO make it so it detects whether editing shirt number OR position OR role
            //if role : from one change, apply changes on all positions
            //if shirt number : check that the change is allowed then apply or not
            //if position: swap player with player of the target position
    
            if (this.isInsideShirtNum(mouseX, mouseY)) {
                // Display form or dialog box to edit properties of 'pos'
                this.editShirtNum();
            } else if (this.isInsideSymbol(mouseX, mouseY)) {
                // Display form or dialog box to edit properties of 'pos'
                this.editSymbol();
            } else {
                console.log("Nothing was picked as editable for mouseX = ",mouseX, " and mouseY = ",mouseY)
    
            }
        }

    }

    editShirtNum(currentShirtNums,fullShirtNums) {
        // Display a form or dialog box to edit shirtnum property 
        console.log("currentShirtNums: ",currentShirtNums)
        console.log("fullShirtNums: ",fullShirtNums)
        const newShirtNum = prompt("Enter new shirt number.", this.shirtnum);
        if ((newShirtNum !== null )) {
            if (!(currentShirtNums.includes(parseInt(newShirtNum)))) {
                if (fullShirtNums.includes(parseInt(newShirtNum))) {
                    this.shirtnum = parseInt(newShirtNum);
                }
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

        const newValue = prompt("Enter new position value (1-6 only):", this.value);
        if (newValue !== null) {
            this.value = newValue;
        }


        // Repeat this process for other properties if needed
    }
}

// Export the class to make it accessible in other files
export default Position;