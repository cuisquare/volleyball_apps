function drawPosition(position) {
    const poscontext = position.context;
    poscontext.save();

    poscontext.beginPath();
    poscontext.strokeStyle = position.color;
    poscontext.lineWidth = 3;

    poscontext.translate(position.xpos, position.ypos);
    poscontext.rotate(-position.total_angle);

    poscontext.fillStyle = position.colorbackground;
    poscontext.fillRect(
        -0.5 * position.width,
        -0.5 * position.height,
        position.width,
        position.height
    );

    if (position.drawsquare) {
        poscontext.rect(
            -0.5 * position.width,
            -0.5 * position.height,
            position.width,
            position.height
        );
        poscontext.stroke();
    }
    poscontext.closePath();

    if (position.drawfeet && position.backgroundImage) {
        poscontext.drawImage(
            position.backgroundImage,
            -0.5 * position.width,
            -0.5 * position.height,
            position.width,
            position.height
        );
    }

    poscontext.textAlign = "center";
    poscontext.textBaseline = "middle";
    poscontext.font = "bold 20px Arial";
    poscontext.fillStyle = "#000";
    poscontext.fillText(position.shirtnum, 0, 0);

    poscontext.textAlign = "left";
    poscontext.textBaseline = "bottom";
    poscontext.font = "15px Arial";
    poscontext.fillText(position.symbol, -0.8 * position.width, 0.9 * position.height);

    poscontext.textAlign = "right";
    poscontext.textBaseline = "bottom";
    poscontext.font = "15px Arial";
    poscontext.fillText(position.rotationPosition, 0.8 * position.width, 0.9 * position.height);

    poscontext.restore();
}

function drawCourt(lineup) {
    const lucontext = lineup.context;
    lucontext.beginPath();
    lucontext.strokeStyle = lineup.colorcourtline;
    lucontext.lineWidth = 10;
    lucontext.fillStyle = lineup.colorcourtbackground;
    lucontext.fillRect(0, 0, lineup.courtwidth, lineup.courtheight);
    lucontext.rect(0, 0, lineup.courtwidth, lineup.courtheight);
    lucontext.stroke();
    lucontext.lineWidth = 5;
    lucontext.rect(0, 0, lineup.courtwidth, lineup.courtheight / 3.0);
    lucontext.stroke();
    lucontext.closePath();

    lucontext.textAlign = "left";
    lucontext.textBaseline = "top";
    lucontext.font = "bold 25px Arial";
    lucontext.fillStyle = "black";
    let teamtext = "Team A";
    if (lineup.team == "teamB") {
        teamtext = "Team B";
    }

    lucontext.save();
    lucontext.translate(0.5 * lineup.canvas.width, 0.5 * lineup.canvas.height);
    lucontext.rotate(-lineup.total_angle);
    lucontext.translate(-0.5 * lineup.canvas.width, -0.5 * lineup.canvas.height);
    lucontext.textAlign = "bottom";
    lucontext.textBaseline = "left";
    lucontext.fillText(
        teamtext,
        0.025 * lucontext.canvas.width,
        0.925 * lucontext.canvas.height
    );
    lucontext.restore();

    const color_arrow = "black";
    const arrowSize = 0.04 * lineup.courtheight;
    const arrowX = lineup.courtwidth - arrowSize;
    const arrowY = 0;

    lucontext.beginPath();
    lucontext.lineWidth = 1;
    lucontext.moveTo(arrowX, arrowY);
    lucontext.lineTo(arrowX + arrowSize / 2, arrowY + arrowSize);
    lucontext.stroke();
    lucontext.lineTo(arrowX - arrowSize / 2, arrowY + arrowSize);
    lucontext.stroke();
    lucontext.fillStyle = color_arrow;
    lucontext.fill();
    lucontext.closePath();

    lucontext.beginPath();
    lucontext.strokeStyle = color_arrow;
    lucontext.lineWidth = 1;
    lucontext.rect(arrowX - arrowSize / 6, arrowY + arrowSize, arrowSize / 3, arrowSize / 2);
    lucontext.stroke();
    lucontext.fillStyle = color_arrow;
    lucontext.fill();
    lucontext.closePath();
}

function drawLineup(lineup, reason = "no reason specified") {
    if (reason != "no reason specified") {
        console.log("Drawing lineup for the follwoing reason: ", reason);
    }

    lineup.context.clearRect(0, 0, lineup.courtwidth, lineup.courtheight);
    drawCourt(lineup);

    if (!lineup.isDragging) {
        console.log("Not dragging, so drawing everything!");
        lineup.positions.forEach(pos => {
            drawPosition(pos);
        });
        return;
    }

    console.log("Dragging, so drawing only what is being dragged!");
    lineup.notDraggingPositions.forEach(pos => {
        drawPosition(pos);
    });

    lineup.draggingPositions.forEach(pos => {
        drawPosition(pos);
    });
}

export {drawPosition, drawCourt, drawLineup};
