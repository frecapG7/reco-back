
const sinon = require("sinon");
const Token = require("../../model/Token");
const adminService = require('./adminService');


describe('Test createAdmin', () => {

    let tokenStub;

    beforeEach(() => {
        tokenStub = sinon.stub(Token.prototype, 'save');
    });

    afterEach(() => {
        tokenStub.restore();
    });


    it('Should save a new token', async () => {
        const expected = new Token();
        tokenStub.returns(expected);

        const result = await adminService.createToken('tokenType');

        sinon.assert.calledOnce(tokenStub);

        expect(result).toEqual(expected);
    });

});