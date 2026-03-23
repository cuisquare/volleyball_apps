function addPosTupleToArray(mypos1, mypos2, postuplearray) {
    const postuple = [mypos1, mypos2];
    let found = false;

    for (let i = 0; i < postuplearray.length; i++) {
        const tuple = postuplearray[i];
        const pos1 = tuple[0];
        const pos2 = tuple[1];

        if ((mypos1.value == pos1.value && mypos2.value == pos2.value) | (mypos1.value == pos2.value && mypos2.value == pos1.value)) {
            found = true;
            break;
        }
    }

    if (!found) {
        postuplearray.push(postuple);
    }

    return postuplearray;
}

function removePosTupleFromArray(mypos1, mypos2, postuplearray) {
    for (let i = 0; i < postuplearray.length; i++) {
        const tuple = postuplearray[i];
        const pos1 = tuple[0];
        const pos2 = tuple[1];

        if ((mypos1.value == pos1.value && mypos2.value == pos2.value) | (mypos1.value == pos2.value && mypos2.value == pos1.value)) {
            postuplearray.splice(i, 1);
            return postuplearray;
        }
    }

    return postuplearray;
}

function checkSinglePositionLegalityOldRules(pos1, pos2) {
    let vertlegal = true;
    if (pos1.hor == pos2.hor) {
        let fp = pos1;
        let bp = pos2;
        if (pos1.isbackrow) {
            fp = pos2;
            bp = pos1;
        }
        const bp_frontfeet_pos = bp.ypos - 0.5 * bp.height;
        const fp_frontfeet_pos = fp.ypos - 0.5 * fp.height;
        vertlegal = bp_frontfeet_pos >= fp_frontfeet_pos;
    }

    let horlegal = true;
    if (pos1.vert == pos2.vert) {
        let lp = pos1;
        let rp = pos2;
        if (pos1.hor > pos2.hor) {
            lp = pos2;
            rp = pos1;
        }
        const lp_rightfeet_pos = lp.xpos + 0.5 * lp.width;
        const rp_rightfeet_pos = rp.xpos + 0.5 * rp.width;
        horlegal = lp_rightfeet_pos <= rp_rightfeet_pos;
    }

    return vertlegal & horlegal;
}

function checkSinglePositionLegalityNewRules(pos1, pos2) {
    let vertlegal = true;
    if (pos1.hor == pos2.hor) {
        let fp = pos1;
        let bp = pos2;
        if (pos1.isbackrow) {
            fp = pos2;
            bp = pos1;
        }
        const bp_backfeet_pos = bp.ypos + 0.5 * bp.height;
        const fp_frontfeet_pos = fp.ypos - 0.5 * fp.height;
        vertlegal = bp_backfeet_pos > fp_frontfeet_pos;
    }

    let horlegal = true;
    if (pos1.vert == pos2.vert) {
        let lp = pos1;
        let rp = pos2;
        if (pos1.hor > pos2.hor) {
            lp = pos2;
            rp = pos1;
        }
        const lp_leftfeet_pos = lp.xpos - 0.5 * lp.width;
        const rp_rightfeet_pos = rp.xpos + 0.5 * rp.width;
        horlegal = lp_leftfeet_pos < rp_rightfeet_pos;
    }

    return vertlegal & horlegal;
}

function checkSinglePositionLegality(pos1, pos2, oldrules = false) {
    if (oldrules) {
        return checkSinglePositionLegalityOldRules(pos1, pos2);
    }

    return checkSinglePositionLegalityNewRules(pos1, pos2);
}

function getIllegalPositionTuples(checkedpositions, otherPositions, oldrules = false, illegalPositionTuples = []) {
    const updatedIllegalPositionTuples = illegalPositionTuples.slice();

    checkedpositions.forEach(pos1 => {
        otherPositions.forEach(pos2 => {
            if (!checkSinglePositionLegality(pos1, pos2, oldrules)) {
                addPosTupleToArray(pos1, pos2, updatedIllegalPositionTuples);
            } else {
                removePosTupleFromArray(pos1, pos2, updatedIllegalPositionTuples);
            }
        });
    });

    return updatedIllegalPositionTuples;
}

export {
    addPosTupleToArray,
    removePosTupleFromArray,
    checkSinglePositionLegality,
    checkSinglePositionLegalityOldRules,
    checkSinglePositionLegalityNewRules,
    getIllegalPositionTuples
};
