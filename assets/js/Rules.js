class Rules {
    constructor(regsetpts=25, nbsetswin=3,maxnumberplayers=14,minliberoifthirteen=2, decidersetpts= 15) {
        this.regsetpts = regsetpts;
        this.nbsetswin = nbsetswin;
        this.maxnumberplayers = maxnumberplayers;
        this.minliberoifthirteen = minliberoifthirteen;

        this.decidersetpts = decidersetpts;

        this.maxlibero = 2;
        this.minliberoiffourteen = 2;

    }
}

// Export the class to make it accessible in other files
export default Rules;