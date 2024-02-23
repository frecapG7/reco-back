const sinon = require("sinon");
const User = require("../../model/User");

const creditService = require('./creditService');
const { InvalidCreditError } = require("../../errors/error");



describe('Test addCredit service', () => {



    it('Should return not found error', async() => {

        await expect(creditService.addCredit(5, null))
            .rejects
            .toThrow(InvalidCreditError);
    });

    it('Should add credit to user', async () => {


        const result = await creditService.addCredit(5, {
            balance: 10,
            save: sinon.stub().resolvesThis()
        });

        expect(result.balance).toEqual(15);

    });
});


describe('Test removeCredit function', () => {

    it('Should return a not found error', async () => {
        await expect(creditService.removeCredit(5, null))
            .rejects
            .toThrow(InvalidCreditError);
    });

    it('Should return a not enought credit error', async () => {
         
        await expect(creditService.removeCredit(5, {
            balance: 3,
        }))
            .rejects
            .toThrow(InvalidCreditError);
    });
  

    it('Should return updated user', async () => {
    
        const result = await creditService.removeCredit(5, {
            balance: 5,
            save: sinon.stub().resolvesThis()
        });

        expect(result.balance).toEqual(0);
    });


});
