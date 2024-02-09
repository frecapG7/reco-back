const { NotFoundError, ForbiddenError } = require('../../errors/error');
const Token = require('../../model/Token');
const { validateToken } = require('./tokenValidation');
const sinon = require('sinon');


describe('Test validateToken function', () => {


    let tokenStub;

    beforeEach(() => {
        tokenStub = sinon.stub(Token, 'findOne');
    });
    afterEach(() => {
        tokenStub.restore();
    });


    it('Should throw NotFoundError', async () => {
        tokenStub.withArgs(
            {
                value: 'fd1eze45',
                used: false
            }
        ).resolves(null);

        expect(validateToken('fd1eze45'))
            .rejects
            .toThrow(NotFoundError);

    });


    it('Should throw ForbiddenError', async () => {
        tokenStub.withArgs(
            {
                value: 'fd1eze45',
                used: false
            }
        ).resolves({
            _id: '1234',
            expiration: new Date(Date.UTC(1990, 1, 1))
        });

        expect(validateToken('fd1eze45'))
            .rejects
            .toThrow(ForbiddenError);
    });

    it('Should be happy path', async () => {
        tokenStub.withArgs(
            {
                value: 'fd1eze45',
                used: false
            }
        ).resolves(new Token());

        await validateToken('fd1eze45');

    });

});