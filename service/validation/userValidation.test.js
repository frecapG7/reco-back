const  User = require('../../model/User');
const sinon = require('sinon');
const userValidator = require('./userValidation');
const { AlreadyUsedException } = require('../../errors/error');


describe('Test validateEmailUnicity function', () => {

    let userStub;

    beforeEach(() => {
        userStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
        userStub.restore();
    });


    it('Should throw already used error', async () => {

        userStub.withArgs({
            email: 'leokram@int.fr'
        }).resolves({ _id: '12345' });


        expect(userValidator.validateEmailUnicity('leokram@int.fr'))
            .rejects
            .toThrow(AlreadyUsedException);

    });

    it('Should be happy path', async () => {

        userStub.withArgs({
            email: 'leokram@int.fr'
        }).resolves(null);

        await userValidator.validateEmailUnicity('leokram@int.fr');
    });
});
describe('Test validateUsernameUnicity function', () => {

    let userStub;

    beforeEach(() => {
        userStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
        userStub.restore();
    });


    it('Should throw already used error', async () => {

        userStub.withArgs({
            name: 'AsirMov'
        }).resolves({ _id: '12345' });


        expect(userValidator.validateUsernameUnicity('AsirMov'))
            .rejects
            .toThrow(AlreadyUsedException);

    });

    it('Should be happy path', async () => {

        userStub.withArgs({
            email: 'AsirMov'
        }).resolves(null);

        await userValidator.validateUsernameUnicity('AsirMov');
    });
});