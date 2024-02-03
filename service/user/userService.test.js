const sinon = require('sinon');
const User = require('../../model/User');
const userService = require('./userService');
const { NotFoundError, ForbiddenError } = require('../../errors/error');
const mongoose = require('mongoose');
const tokenValidation = require('../validation/tokenValidation');
const tokenService = require('../token/tokenService');
const userValidation = require('../validation/userValidation');



describe('Test getUser', () => {

    let userFindByIdStub;

    beforeEach(() => {
        userFindByIdStub = sinon.stub(User, 'findById');
    });
    afterEach(() => {
        userFindByIdStub.restore();
    });



    it('Should throw a not found error', async () => {
        userFindByIdStub.resolves(null);

        await expect(userService.getUser('123'))
            .rejects
            .toThrow(NotFoundError);
    });


    it('Should return user', async () => {

        const expected = new User();
        userFindByIdStub.resolves(expected);

        const result = await userService.getUser('123');
        expect(userFindByIdStub.calledWith('123')).toEqual(true);
        expect(result).toEqual(expected);

    });

});

describe('Test createUser', () => {


    let validateEmailStub;
    let validateUsernameStub;
    let validateTokenStub;
    let mongooseStub;
    let getTokenStub;
    let flagAsUsedStub;
    let userSaveStub;

    beforeEach(() => {
        validateEmailStub = sinon.stub(userValidation, 'validateEmailUnicity');
        validateUsernameStub = sinon.stub(userValidation, 'validateUsernameUnicity');
        validateTokenStub = sinon.stub(tokenValidation, 'validateToken');
        mongooseStub = sinon.stub(mongoose, 'startSession');
        getTokenStub = sinon.stub(tokenService, 'getToken');
        flagAsUsedStub = sinon.stub(tokenService, 'flagAsUsed');
        userSaveStub = sinon.stub(User.prototype, 'save');
    });
    afterEach(() => {
        validateEmailStub.restore();
        validateUsernameStub.restore();
        validateTokenStub.restore();
        mongooseStub.restore();
        getTokenStub.restore();
        flagAsUsedStub.restore();
        userSaveStub.restore();
    });


    it('Should reject on invalid token', async () => {

        validateEmailStub.resolves();
        validateUsernameStub.resolves();
        validateTokenStub.resolves();

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);

        getTokenStub.withArgs('3354az')
            .resolves({ _id: '3354az', type: 'INVALID' });


        await expect(userService.createUser({
            name: 'test',
            email: 'test',
            password: 'test',
        }, '3354az'))
            .rejects
            .toThrow(ForbiddenError);

        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
        expect(sessionStub.abortTransaction).toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    });

    it('Should rollback transaction', async () => {

        validateEmailStub.resolves();
        validateUsernameStub.resolves();
        validateTokenStub.resolves();

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);

        getTokenStub.resolves({ _id: '3354az', type: 'ACCOUNT_CREATION'});
        flagAsUsedStub.withArgs({ _id: '3354az' }).resolves();

        userSaveStub.throws(new Error('test'));

        await expect(userService.createUser({
            name: 'test',
            email: 'test',
            password: 'test',
        }, '3354az'))
            .rejects
            .toThrow(Error);

        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
        expect(sessionStub.abortTransaction).toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    });

    it('Should test happy path', async () => {

        validateEmailStub.resolves();
        validateUsernameStub.resolves();
        validateTokenStub.resolves();

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);

        getTokenStub.resolves({ _id: '3354az' , type: 'ACCOUNT_CREATION'});
        flagAsUsedStub.withArgs({ _id: '3354az' }).resolves();

        userSaveStub.resolves({ _id: '123' });


        const result = await userService.createUser({
            name: 'test',
            email: 'test',
            password: 'test',
        }, '3354az');

        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).toHaveBeenCalled();
        expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

        expect(result).toEqual({
            _id: '123'
        });

    });


});

describe('Test updateUser', () => {

    let userFindByIdAndUpdateStub;

    beforeEach(() => {
        userFindByIdAndUpdateStub = sinon.stub(User, 'findByIdAndUpdate');
    });
    afterEach(() => {
        userFindByIdAndUpdateStub.restore();
    });


    it('Should throw a not found error', async () => {

        userFindByIdAndUpdateStub.resolves(null);

        await expect(userService.updateUser('123', {}))
            .rejects
            .toThrow(NotFoundError);


    });
    it('Should test happy path', async () => {

        const expected = new User();
        userFindByIdAndUpdateStub.resolves(expected);

        const result = await expect(userService.updateUser('123', {
            name: 'test',
            email: 'test',
        }));


        expect(userFindByIdAndUpdateStub.calledWith('123', {
            name: 'test',
            email: 'test',
        }, { new: true }));

        // expect(result).toEqual(expected);





    });



});