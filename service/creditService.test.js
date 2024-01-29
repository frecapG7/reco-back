const sinon = require("sinon");
const User = require("../model/User");

const creditService = require('./creditService');
const { InvalidCreditError } = require("../errors/error");



describe('Test addCredit service', () => {

    let userStub;

    beforeEach(() => {
        userStub = sinon.stub(User, 'findById');
    });

    afterEach(() => {
        userStub.restore();
    });


    it('Should return not found error', async() => {
        userStub.resolves(null);


        await expect(creditService.addCredit(5, '123'))
            .rejects
            .toThrow(InvalidCreditError);
    });

    it('Should add credit to user', async () => {
        const user = {
            credit: 10,
            save: jest.fn()
        }

        userStub.resolves(user);

        await creditService.addCredit(5, '123');

        expect(user.credit).toEqual(15);

    });
});


describe('Test removeCredit function', () => {
    let userStub;

    beforeEach(() => {
        userStub = sinon.stub(User, 'findById');
    });

    afterEach(() => {
        userStub.restore();
    });

    it('Should return a not found error', async () => {
        userStub.resolves(null);
    
    
        await expect(creditService.removeCredit(5, '123'))
            .rejects
            .toThrow(InvalidCreditError);
    });

    it('Should return a not enought credit error', async () => {
        const user = {
            credit: 3,
            save: jest.fn()
        };
        userStub.resolves(user);
    
        await expect(creditService.removeCredit(5, '123'))
            .rejects
            .toThrow(InvalidCreditError);
    });
  


    it('Should return a not enought credit error', async () => {
        const user = {
            credit: 3,
            save: jest.fn()
        };
        userStub.resolves(user);
    
        await expect(creditService.removeCredit(5, '123'))
            .rejects
            .toThrow(InvalidCreditError);
    });

    it('Should return updated user', async () => {
        const user = {
            credit: 5,
            save: jest.fn()
        };
        userStub.resolves(user);
    
        const result = await creditService.removeCredit(5, '123');

        expect(user.credit).toEqual(0);
    });


});
