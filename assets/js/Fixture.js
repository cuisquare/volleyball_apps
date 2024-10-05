import Rules from './Rules.js';

class Fixture {
    constructor(game_id,venue, officialdate,officialstarttime,officialendtime,hometeam,awayteam,rules) {
        this.game_id = game_id;
        this.venue = venue;
        this.officialdate = officialdate;
        this.officialstarttime = officialstarttime;
        this.officialendtime = officialendtime;

        this.hometeam = hometeam;
        this.awayteam = awayteam;
        this.rules = rules;
    }

    // Setter method to enforce that 'position' is an instance of Position
    set rules(rulz) {
        if (!(rulz instanceof Rules)) {
            throw new Error("rules must be an instance of Rules class");
        }
        this._rules = rulz;
    }

    // Getter method to access the 'position'
    get rules() {
        return this._rules;
    }
}

// Export the class to make it accessible in other files
export default Fixture;