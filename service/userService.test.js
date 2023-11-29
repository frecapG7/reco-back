const sinon = require('sinon');
const User = require('../model/User');
const userService = require('./userService');
const { NotFoundError, ForbiddenError } = require('../errors/error');


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


    let userFindOneStub;
    let userSaveStub;

    beforeEach(() => {
        userFindOneStub = sinon.stub(User, 'findOne');
        userSaveStub = sinon.stub(User.prototype, 'save');
    });
    afterEach(() => {
        userFindOneStub.restore();
        userSaveStub.restore();
    });

    it('Should throw a forbidden error', async () => {

        userFindOneStub.resolves(true);

        await expect(userService.createUser({
            name: 'test',
            email: 'test',
            password: 'test',
        }))
            .rejects
            .toThrow(ForbiddenError);

    });

    it('Should test happy path', async () => {

        const expected = new User();
        userFindOneStub.resolves(false);
        userSaveStub.resolves(expected);

        const result = await userService.createUser({
            name: 'test',
            email: 'test',
            password: 'test',
        });

        expect(userFindOneStub.calledWith({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        })).toEqual(true);

        expect(userSaveStub.calledWith()).toEqual(true);

        expect(result).toEqual(expected);

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