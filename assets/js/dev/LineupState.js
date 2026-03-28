class LineupState {
    constructor(shirtnums = [15,16,17,18,19,20], symbols = []) {
        this.editmode = "freeswap"; //"freeswap", "override" , "ingame"
        this.playerappearance = "square"; //"feetandsquare", "feet" , "square"

        this.shirtnums = shirtnums.slice();
        this.defaultsymbols = ["S","O1","M1","Opp","O2","M2"];
        this.symbols = symbols.length === 0 ? this.defaultsymbols.slice() : symbols.slice();
        this.fullshirtnums = this.shirtnums.slice();
        this.oldRules = false;
        this.persistentMode = false;

        this.positions = [];
        this.illegalPositionTuples = [];
        this._defaultvalues = [1,2,3,4,5,6];
    }

    get defaultvalues() {
        console.log("I was in the getter for this.defaultvalues");
        return this._defaultvalues;
    }

    set defaultvalues(newdefaultvalues) {
        console.log("I was in the setter for this.defaultvalues");
        console.log("attempted to set defaultvalues to " + newdefaultvalues + " but this is forbidden.");
    }

    get values() {
        var actualvalues = [];
        this.positions.forEach(pos => {
            actualvalues.push(pos.rotationPosition);
        });
        console.log("values: "+ actualvalues);
        return actualvalues;
    }

    addShirtnum(newShirtNum) {
        if (!this.fullshirtnums.includes(newShirtNum)) {
            this.fullshirtnums.push(newShirtNum);
        }
    }

    setFullShirtNums(newFullShirtNums) {
        this.fullshirtnums = newFullShirtNums.slice();
    }

    getValidShirtNums(mode = "override") {
        console.log("currentShirtNums: ",this.shirtnums);
        console.log("fullShirtNums: ",this.fullshirtnums);
        var validshirtnums = Array.from({ length: 99 }, (_, i) => i + 1);
        if (mode == "freeswap") {
            console.log("mode is freeswap, running this code");
            validshirtnums = this.fullshirtnums;
        }
        if (mode == "ingame") {
            console.log("mode is ingame, running this code");
            validshirtnums = this.fullshirtnums.filter(item => !this.shirtnums.includes(item));
        }
        console.log("valid shirtnums : " + validshirtnums);

        return validshirtnums;
    }

    ellipsisArray(arr,maxnumdisplay=3, numstartellipsis = 14) {
        if (arr.length <= numstartellipsis) {
            var output = arr.join(',');
        } else {
            const firstThree = arr.slice(0, maxnumdisplay);
            const lastThree = arr.slice(-maxnumdisplay);

            var output = [...firstThree, '...', ...lastThree].join(',');
        }

        console.log(output);

        return output;
    }

    findPositionByShirtNum(shirtnum) {
        return this.positions.find(pos => pos.shirtnum === shirtnum);
    }

    getShirtNums(positions) {
        var shirtnums = [];
        positions.forEach(pos => {
            shirtnums.push(pos.shirtnum);
        });
        return shirtnums;
    }

    removePositionsByValue(value,positions) {
        var result = positions.filter(obj => {
            return obj.rotationPosition !== value;
        });
        return result;
    }
}

export default LineupState;
