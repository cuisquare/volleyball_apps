import {logmyobject, convertToRotatedCoords} from './utils.js';

function addPositionEventListeners(position) {
    position.canvas.addEventListener('mousedown', position.mdref);
    position.canvas.addEventListener('mousemove', position.mmref);
    position.canvas.addEventListener('mouseup', position.muref);
    position.canvas.addEventListener('touchstart', position.tsref);
    position.canvas.addEventListener('touchmove', position.tmref);
    position.canvas.addEventListener('touchend', position.teref);
}

function removePositionEventListeners(position) {
    position.canvas.removeEventListener('mousedown', position.mdref);
    position.canvas.removeEventListener('mousemove', position.mmref);
    position.canvas.removeEventListener('mouseup', position.muref);
    position.canvas.removeEventListener('touchstart', position.tsref);
    position.canvas.removeEventListener('touchmove', position.tmref);
    position.canvas.removeEventListener('touchend', position.teref);
}

function isInsideBox(position, x, y, xmin, xmax, ymin, ymax) {
    console.log("in isInsideBox");
    console.log("x, y,xmin,xmax,ymin,ymax: ", x, ", ", y, ", ", xmin, ", ", xmax, ", ", ymin, ", ", ymax);
    const output = x >= xmin && x <= xmax && y >= ymin && y <= ymax;

    if (output) {
        console.log("!!!!! IS INSIDE BOX !!!!");
    } else {
        console.log("!!!!! is NOT inside box !!!!");
    }
    return output;
}

function isInsideShirtNum(position, mouseX, mouseY) {
    const w4 = 0.375 * position.width;
    const centerX = position.canvas.width / 2;
    const centerY = position.canvas.height / 2;
    const rotatedCoords = convertToRotatedCoords(mouseX, mouseY, position.total_angle, centerX, centerY);

    return isInsideBox(
        position,
        rotatedCoords.x,
        rotatedCoords.y,
        position.xpos - w4,
        position.xpos + w4,
        position.ypos - w4,
        position.ypos + w4
    );
}

function isInsideSymbol(position, mouseX, mouseY, isUpright, leftcourt) {
    const w1 = 0.5 * position.width;
    const w2 = 0.25 * position.width;
    const w3 = 1.25 * position.width;

    console.log("INSIDE  isInsideSymbol");
    console.log("this.canvas: ", position.canvas);
    console.log("this.canvas.width: ", position.canvas.width);
    console.log("this.canvas.height: ", position.canvas.height);

    const centerX = position.canvas.width / 2;
    const centerY = position.canvas.height / 2;
    const rotatedCoords = convertToRotatedCoords(mouseX, mouseY, position.total_angle, centerX, centerY);

    if (isUpright) {
        return isInsideBox(
            position,
            rotatedCoords.x,
            rotatedCoords.y,
            position.xpos - w3,
            position.xpos - w1,
            position.ypos + w2,
            position.ypos + w3
        );
    }

    if (leftcourt) {
        return isInsideBox(
            position,
            rotatedCoords.x,
            rotatedCoords.y,
            position.xpos + w2,
            position.xpos + w3,
            position.ypos + w1,
            position.ypos + w3
        );
    }

    return isInsideBox(
        position,
        rotatedCoords.x,
        rotatedCoords.y,
        position.xpos - w3,
        position.xpos - w2,
        position.ypos - w3,
        position.ypos - w1
    );
}

function isInsidePositionValue(position, mouseX, mouseY, isUpright, leftcourt) {
    console.log("INSIDE  isInsidePositionValue");
    console.log("isUpright:" + isUpright);
    console.log("leftcourt:" + leftcourt);
    console.log("this.canvas: ", position.canvas);
    console.log("this.canvas.width: ", position.canvas.width);
    console.log("this.canvas.height: ", position.canvas.height);
    console.log("posL " + position);

    const centerX = position.canvas.width / 2;
    const centerY = position.canvas.height / 2;
    const w1 = 0.5 * position.width;
    const w2 = 0.25 * position.width;
    const w3 = 1.25 * position.width;
    const rotatedCoords = convertToRotatedCoords(mouseX, mouseY, position.total_angle, centerX, centerY);

    if (isUpright) {
        console.log("upright court");
        return isInsideBox(
            position,
            rotatedCoords.x,
            rotatedCoords.y,
            position.xpos + w1,
            position.xpos + w3,
            position.ypos + w2,
            position.ypos + w3
        );
    }

    if (leftcourt) {
        console.log("sideway left court");
        return isInsideBox(
            position,
            rotatedCoords.x,
            rotatedCoords.y,
            position.xpos + w2,
            position.xpos + w3,
            position.ypos - w3,
            position.ypos - w1
        );
    }

    console.log("sideway right court");
    return isInsideBox(
        position,
        rotatedCoords.x,
        rotatedCoords.y,
        position.xpos - w3,
        position.xpos - w2,
        position.ypos + w1,
        position.ypos + w3
    );
}

function isInsidePosition(position, x, y) {
    return isInsideBox(
        position,
        x,
        y,
        position.xpos - 0.5 * position.width,
        position.xpos + 0.5 * position.width,
        position.ypos - 0.5 * position.width,
        position.ypos + 0.5 * position.width
    );
}

function onPositionTouchStart(position, event) {
    position.touchStartTime = Date.now();
    const rect = position.canvas.getBoundingClientRect();
    const touchStartPositionX = event.changedTouches[0].clientX - rect.left;
    const touchStartPositionY = event.changedTouches[0].clientY - rect.top;
    const centerX = position.canvas.width / 2;
    const centerY = position.canvas.height / 2;
    const rotatedCoords = convertToRotatedCoords(touchStartPositionX, touchStartPositionY, position.total_angle, centerX, centerY);

    if (isInsidePosition(position, rotatedCoords.x, rotatedCoords.y)) {
        position.isDragging = true;
        position.dragOffsetX = rotatedCoords.x - position.xpos;
        position.dragOffsetY = rotatedCoords.y - position.ypos;
    }
}

function onPositionMouseDown(position, event) {
    console.log("MOUSE DOWN EVENT");
    const rect = position.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const centerX = position.canvas.width / 2;
    const centerY = position.canvas.height / 2;
    const rotatedCoords = convertToRotatedCoords(mouseX, mouseY, position.total_angle, centerX, centerY);

    if (isInsidePosition(position, rotatedCoords.x, rotatedCoords.y)) {
        position.isDragging = true;
        position.dragOffsetX = rotatedCoords.x - position.xpos;
        position.dragOffsetY = rotatedCoords.y - position.ypos;
    }
}

function onPositionTouchMove(position, event) {
    if (!position.isDragging) {
        return;
    }

    event.preventDefault();
    const rect = position.canvas.getBoundingClientRect();
    const touchStartPositionX = event.changedTouches[0].clientX - rect.left;
    const touchStartPositionY = event.changedTouches[0].clientY - rect.top;
    const centerX = position.canvas.width / 2;
    const centerY = position.canvas.height / 2;
    const rotatedCoords = convertToRotatedCoords(touchStartPositionX, touchStartPositionY, position.total_angle, centerX, centerY);

    position.xpos = rotatedCoords.x - position.dragOffsetX;
    position.ypos = rotatedCoords.y - position.dragOffsetY;

    position.context.clearRect(0, 0, position.canvas.width, position.canvas.height);
    position.draw();
}

function onPositionMouseMove(position, event) {
    if (!position.isDragging) {
        return;
    }

    const rect = position.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const centerX = position.canvas.width / 2;
    const centerY = position.canvas.height / 2;
    const rotatedCoords = convertToRotatedCoords(mouseX, mouseY, position.total_angle, centerX, centerY);

    position.xpos = rotatedCoords.x - position.dragOffsetX;
    position.ypos = rotatedCoords.y - position.dragOffsetY;

    position.context.clearRect(0, 0, position.canvas.width, position.canvas.height);
    position.draw();
}

function onPositionTouchEnd(position, event) {
    position.isDragging = false;
    event.preventDefault();
    position.touchEndTime = Date.now();
    position.touchDuration = position.touchEndTime - position.touchStartTime;
    console.log("Touch duration : ", position.touchDuration);
    if (position.touchDuration < 300) {
        console.log("TAP EVENT");
        onPositionMouseUp(position, event);
        console.log("RUNNING onMouseRightCLick(event)");
        onPositionMouseRightClick(position, event);
    } else {
        console.log("LONG PRESS EVENT");
    }
}

function onPositionMouseUp(position) {
    position.isDragging = false;
}

function onPositionMouseRightClick(position, event) {
    if (!position.independentEdit) {
        return;
    }

    const rect = position.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (isInsideShirtNum(position, mouseX, mouseY)) {
        position.editShirtNum();
    } else if (isInsideSymbol(position, mouseX, mouseY)) {
        position.editSymbol();
    } else if (isInsidePositionValue(position, mouseX, mouseY)) {
        // reserved for future
    } else {
        console.log("Nothing was picked as editable for mouseX = ", mouseX, " and mouseY = ", mouseY);
    }
}

function addLineupEventListeners(lineup) {
    lineup.canvas.addEventListener('mousedown', lineup.mdref);
    lineup.canvas.addEventListener('mousemove', lineup.mmref);
    lineup.canvas.addEventListener('mouseup', lineup.muref);
    lineup.canvas.addEventListener('mouseleave', lineup.mlref);
    lineup.canvas.addEventListener('contextmenu', lineup.mrcref);
    lineup.canvas.addEventListener('touchstart', lineup.tsref);
    lineup.canvas.addEventListener('touchmove', lineup.tmref);
    lineup.canvas.addEventListener('touchend', lineup.teref);
}

function removeLineupEventListeners(lineup) {
    lineup.canvas.removeEventListener('mousedown', lineup.mdref);
    lineup.canvas.removeEventListener('mousemove', lineup.mmref);
    lineup.canvas.removeEventListener('mouseup', lineup.muref);
    lineup.canvas.removeEventListener('mouseleave', lineup.mlref);
    lineup.canvas.removeEventListener('contextmenu', lineup.mrcref);
    lineup.canvas.removeEventListener('touchstart', lineup.tsref);
    lineup.canvas.removeEventListener('touchmove', lineup.tmref);
    lineup.canvas.removeEventListener('touchend', lineup.teref);
}

function onLineupMouseLeave(lineup, event) {
    lineup.positions.forEach((pos) => {
        pos.onMouseUp(event);
    });
}

function onLineupTouchStart(lineup, event) {
    lineup.touchStartTime = Date.now();
    onLineupMouseDown(lineup, event);
}

function onLineupMouseDown(lineup, event) {
    lineup.isDragging = false;
    lineup.notDraggingPositions = lineup.positions;
    lineup.positions.forEach(pos => {
        pos.onMouseDown(event);
        if (pos.isDragging) {
            lineup.isDragging = true;
            lineup.draggingPositions.push(pos);
            lineup.newIllegalPositions = [];
            lineup.removePositionsByValue(pos.rotationPosition, lineup.notDraggingPositions);
        }
    });
}

function onLineupTouchEnd(lineup, event) {
    event.preventDefault();
    lineup.touchEndTime = Date.now();
    lineup.touchDuration = lineup.touchEndTime - lineup.touchStartTime;
    console.log("Touch duration : ", lineup.touchDuration);
    if (lineup.touchDuration < 300) {
        console.log("TAP EVENT");
        const rect = lineup.canvas.getBoundingClientRect();
        const touchX = event.changedTouches[0].clientX - rect.left;
        const touchY = event.changedTouches[0].clientY - rect.top;

        lineup.positions.forEach(pos => {
            if (pos.isInsideShirtNum(touchX, touchY)) {
                logmyobject("calling touch right click on element ", pos);
                logmyobject("editing positions with forbiddent values ", lineup.shirtnums);
                const allowedshirtnums = lineup.getValidShirtNums(lineup.editmode);
                const allowedshirtnumsellipsis = lineup.ellipsisArray(allowedshirtnums);
                const newshirtnum = parseInt(prompt("Enter new shirt number (valid numbers are: " + allowedshirtnumsellipsis + "):", pos.shirtnum));
                lineup.editShirtNum(pos, newshirtnum, lineup.editmode);
                lineup.shirtnums = lineup.getShirtNums(lineup.positions);
            }
            if (pos.isInsideSymbol(touchX, touchY, lineup.isUpright, lineup.leftcourt)) {
                console.log("inside symbol of ", pos, "!");
                const newSymbol = prompt("Enter new symbol (valid symbols are: " + lineup.defaultsymbols + "):", "S");
                lineup.assignDefaultSymbols(pos, newSymbol);
                console.log("No, really, inside symbol of ", pos, "!");
            }
            if (pos.isInsidePositionValue(touchX, touchY, lineup.isUpright, lineup.leftcourt)) {
                console.log("inside value of ", pos);
                console.log("!!!!!!! editing values !!!!!!!!!!!!!!");
                console.log("!!!!!!! editing values !!!!!!!!!!!!!!");
                console.log("!!!!!!! editing values !!!!!!!!!!!!!!");
                const newvalue = parseInt(prompt("Enter new  value (valid values are: " + [1,2,3,4,5,6] + "):", pos.rotationPosition));
                console.log("new values: ", newvalue);
                lineup.editValues(pos, newvalue);
            }
        });
        lineup.draw();
    } else {
        console.log("LONG PRESS EVENT");
    }
    onLineupMouseUp(lineup, event);
}

function onLineupMouseUp(lineup, event) {
    lineup.positions.forEach(pos => {
        pos.onMouseUp(event);
    });

    lineup.isDragging = false;
    lineup.draggingPositions = [];
    lineup.newIllegalPositions = [];
    lineup.notDraggingPositions = lineup.positions;
}

function onLineupMouseRightClick(lineup, event) {
    event.preventDefault();
    const rect = lineup.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    lineup.positions.forEach(pos => {
        if (pos.isInsideShirtNum(mouseX, mouseY)) {
            logmyobject("calling mouse right click on element ", pos);
            logmyobject("editing positions with forbiddent values ", lineup.shirtnums);
            const allowedshirtnums = lineup.getValidShirtNums(lineup.editmode);
            const allowedshirtnumsellipsis = lineup.ellipsisArray(allowedshirtnums);
            const newshirtnum = parseInt(prompt("Enter new shirt number (valid numbers are: " + allowedshirtnumsellipsis + "):", lineup.shirtnum));
            lineup.editShirtNum(pos, newshirtnum, lineup.editmode);
            lineup.shirtnums = lineup.getShirtNums(lineup.positions);
        }
        if (pos.isInsideSymbol(mouseX, mouseY, lineup.isUpright, lineup.leftcourt)) {
            console.log("moomoo inside symbol of ", pos, "!");
            console.log("second moomoo inside symbol of ", pos, "!");
            const newSymbol = prompt("Enter new symbol (valid symbols are: " + lineup.defaultsymbols + "):", "S", lineup.symbol);
            lineup.assignDefaultSymbols(pos, newSymbol);
            console.log("No, really, inside symbol of ", pos, "!");
        }
        if (pos.isInsidePositionValue(mouseX, mouseY, lineup.isUpright, lineup.leftcourt)) {
            console.log("inside value of ", pos);
            console.log("!!!!!!! editing values !!!!!!!!!!!!!!");
            console.log("!!!!!!! editing values !!!!!!!!!!!!!!");
            console.log("!!!!!!! editing values !!!!!!!!!!!!!!");
            const newvalue = parseInt(prompt("Enter new  value (valid values are: " + [1,2,3,4,5,6] + "):", pos.rotationPosition));
            console.log("new values: ", newvalue);
            lineup.editValues(pos, newvalue);
        }
    });
    lineup.draw();
}

function onLineupTouchMove(lineup, event) {
    onLineupMouseMove(lineup, event);
}

function onLineupMouseMove(lineup) {
    if (lineup.isDragging) {
        lineup.checkPositionsLegalityStatic(lineup.draggingPositions, lineup.notDraggingPositions, lineup.oldRules);
        lineup.draw();
    }
}

export {
    addPositionEventListeners,
    removePositionEventListeners,
    isInsideBox,
    isInsideShirtNum,
    isInsideSymbol,
    isInsidePositionValue,
    isInsidePosition,
    onPositionTouchStart,
    onPositionMouseDown,
    onPositionTouchMove,
    onPositionMouseMove,
    onPositionTouchEnd,
    onPositionMouseUp,
    onPositionMouseRightClick,
    addLineupEventListeners,
    removeLineupEventListeners,
    onLineupMouseLeave,
    onLineupTouchStart,
    onLineupMouseDown,
    onLineupTouchEnd,
    onLineupMouseUp,
    onLineupMouseRightClick,
    onLineupTouchMove,
    onLineupMouseMove
};
