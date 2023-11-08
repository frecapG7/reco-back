const sinon = require('sinon');
const User = require('../model/User');
const userService = require('./userService');
const { NotFoundError } = require('../errors/error');



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