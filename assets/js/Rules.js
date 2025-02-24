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
        maxshirtnum = 99
    ) {
        this.regsetpts = regsetpts;
        this.nbsetswin = nbsetswin;
        this.maxnumberplayers = maxnumberplayers;
        this.minliberoifthirteen = minliberoifthirteen;

        this.decidersetpts = decidersetpts;

        this.ptsdiffwinpts = ptsdiffwinpts;
        this.ptsdiffwinset = ptsdiffwinset;


        this.maxlibero = 2;
        this.minliberoiffourteen = 2;

        this.swapsidesindecider = swapsidesindecider;
        this.nbptsforswap = nbptsforswap;

        this.maxshirtnum = maxshirtnum;

    }
}

// Export the class to make it accessible in other files
export default Rules;