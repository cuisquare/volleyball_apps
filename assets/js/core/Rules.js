class Rules {
    constructor(
        regsetpts=25, 
        nbsetswin=3,
        decidersetpts= 15, 
        ptsdiffwinpts = 1, 
        ptsdiffwinset=2,
        swapsidesindecider = true, 
        nbptsforswap = 8,
        maxnumberplayers=14,
        minliberoifthirteen=2,
        allowPlayerStaffRoleCumulation = true,
        breakBetweenSetsMins = 3,
        maxTimeoutsRegularSet = 2,
        maxTimeoutsDeciderSet = 2
    ) {
        this.regsetpts = regsetpts;
        this.nbsetswin = nbsetswin;
        this.maxnumberplayers = maxnumberplayers;
        this.minliberoifthirteen = minliberoifthirteen;
        this.allowPlayerStaffRoleCumulation = allowPlayerStaffRoleCumulation;
        this.breakBetweenSetsMins = breakBetweenSetsMins;
        this.maxTimeoutsRegularSet = maxTimeoutsRegularSet;
        this.maxTimeoutsDeciderSet = maxTimeoutsDeciderSet;

        this.decidersetpts = decidersetpts;

        this.ptsdiffwinpts = ptsdiffwinpts;
        this.ptsdiffwinset = ptsdiffwinset;


        this.maxlibero = 2;
        this.minliberoiffourteen = 2;

        this.swapsidesindecider = swapsidesindecider;
        this.nbptsforswap = nbptsforswap;

    }
}

// Export the class to make it accessible in other files
export default Rules;
