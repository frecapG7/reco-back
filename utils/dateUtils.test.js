const { expect } = require("chai");
const { remainingDays, isPast } = require("./dateUtils");


describe('isPast', () => {

    it('Should return true', () => {
        const result = isPast(new Date("2001-01-01"), new Date("2001-01-10"), "1D");
        expect(result).to.equal(true);
    });

    it('Should return false', () => {
        const result = isPast(new Date("2001-01-01"), new Date("2001-01-03"), "2D");
        expect(result).to.equal(false);
    });
    
});


describe('remainingDays', () => {

    it('Should return 1 day', () => {

        const result = remainingDays(new Date("2001-01-01"), new Date("2001-01-10"), "1D");
        expect(result).to.equal(-1);

    });

    it('Should return 6 day', () => {

        const result = remainingDays(new Date("2001-01-01"), new Date("2001-01-03"), "2D");
        expect(result).to.equal(0);

    });

    it('Should return 8 day', () => {

        const result = remainingDays(new Date("2001-01-01"), new Date("2001-01-03"), "1W");
        expect(result).to.equal(5);

    });

});