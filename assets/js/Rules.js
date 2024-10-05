class Rules {
    constructor(regsetpts=21, nbsetswin=3,maxnumberplayers=14,minliberoifthirteen=1) {
        this.regsetpts = regsetpts;
        this.nbsetswin = nbsetswin;
        this.maxnumberplayers = maxnumberplayers;
        this.minliberoifthirteen = minliberoifthirteen;

        this.maxlibero = 2;
        this.minliberoiffourteen = 2;

    }
}

// Export the class to make it accessible in other files
export default Rules;