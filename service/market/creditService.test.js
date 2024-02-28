const sinon = require("sinon");
const User = require("../../model/User");

const creditService = require('./creditService');
const { InvalidCreditError } = require("../../errors/error");



describe('Test addCredit service', () => {


    let userStub;

    beforeEach(() => {
        userStub = sinon.stub(User, 'findById');
    });
    afterEach(() => {
        userStub.restore();
    });

    it('Should return not found error', async () => {


        userStub.withArgs('123455').resolves(null);

        await expect(creditService.addCredit(5, { _id: '123455' }))
            .rejects
            .toThrow(InvalidCreditError);
    });

    it('Should add credit to user', async () => {

        userStub.withArgs('123455').resolves({
            balance: 10,
            save: sinon.stub().resolvesThis()
        });

        const result = await creditService.addCredit(5, { _id: '123455' });

        expect(result.balance).toEqual(15);

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
        userStub.withArgs('123455').resolves(null);

        await expect(creditService.removeCredit(5, { _id: '123455' }))
            .rejects
            .toThrow(InvalidCreditError);
    });

    it('Should return a not enought credit error', async () => {

        userStub.withArgs('123455').resolves({
            balance: 3,
        });

        await expect(creditService.removeCredit(5, { _id: '123455' }))
            .rejects
            .toThrow(InvalidCreditError);
    });


    it('Should return updated user', async () => {

        userStub.withArgs('123455').resolves({
            balance: 5,
            save: sinon.stub().resolvesThis()
        });

        const result = await creditService.removeCredit(5, { _id: '123455' });

        expect(result.balance).toEqual(0);
    });


});
