class CourtPlayerState {
    constructor(rotationPosition, shirtnum, symbol = "P") {
        if (!([1, 2, 3, 4, 5, 6].includes(rotationPosition))) {
            throw('rotationPosition can only take any of the following values: [1,2,3,4,5,6], but attempted value was: ' + rotationPosition.toString());
        }

        this._rotationPosition = rotationPosition;
        this.shirtnum = shirtnum;
        this.symbol = symbol;

        this._courtX = 0;
        this._courtY = 0;
        this._prevCourtX = 0;
        this._prevCourtY = 0;

        this.assignLaterality();
    }

    get rotationPosition() {
        return this._rotationPosition;
    }

    set rotationPosition(newRotationPosition) {
        this._rotationPosition = newRotationPosition;
    }

    get value() {
        return this.rotationPosition;
    }

    set value(newValue) {
        this.rotationPosition = newValue;
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
        const allvalues = [1,2,3,4,5,6];
        const currindex = allvalues.indexOf(this.rotationPosition);
        const previndex = (currindex + 1) % 6;
        return allvalues[previndex];
    }
}

export default CourtPlayerState;
