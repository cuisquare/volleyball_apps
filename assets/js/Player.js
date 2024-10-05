
class Player {
    constructor(shirtnum = 0,firstname="firstname",lastname = "lastname",regnum="00000",isLibero = false) {
        this.shirtnum = shirtnum;
        this.firstname = firstname;
        this.lastname = lastname;
        this.regnum = regnum;
        this.isLibero = isLibero;
    }


}

// Export the class to make it accessible in other files
export default Player;