const authService = require('./authService');
const User = require('../../model/User');
const sinon = require('sinon');
const { ForbidenError, UnAuthorizedError } = require('../../errors/error');
const OAuthToken = require('../../model/OAuthToken');
const { isArguments } = require('lodash');

describe("Test login", () => {

    let userStub;

    beforeEach(() => {
        userStub = sinon.stub(User, 'findOne');
    });
    afterEach(() => {
        userStub.restore();
    });

    it('Should fail on missing user', async () => {

        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves(null);


        await expect(authService.login('test', 'test'))
            .rejects
            .toThrow(ForbidenError);

    });

    it('Should return a wrong password', async () => {

        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves({
            validPassword: sinon.stub().returns(false)
        });

        await expect(authService.login('test', 'test'))
            .rejects
            .toThrow(ForbidenError);

    });


    it('Should return user', async () => {

        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves({
            _id: 'test',
            validPassword: sinon.stub().returns(true)
        });

        const result = await authService.login('test', 'test');

        expect(result).toBeDefined();
        expect(result._id).toEqual('test');
    });


});

describe("Test logout", () => {

    let oAuthTokenStub;

    beforeEach(() => {
        oAuthTokenStub = sinon.stub(OAuthToken, 'findOne');
    });
    afterEach(() => {
        oAuthTokenStub.restore();
    });

    it('Should not remove oAuthToken', async () => {

        oAuthTokenStub.withArgs({ user: 'test' }).resolves(null);

        await expect(authService.logout({ _id: 'test' }))
            .resolves
            .toBeUndefined();
    });

    it('Should remove oAuthToken', async () => {

        const token = {
            remove: jest.fn()
        };

        oAuthTokenStub.withArgs({ user: 'test' }).resolves(token);

        await expect(authService.logout({ _id: 'test' }))
            .resolves;

        expect(token.remove).toBeCalled();

    });
}
);

describe("Test validateAccessToken", () => {

    let oAuthTokenStub;

    beforeEach(() => {
        oAuthTokenStub = sinon.stub(OAuthToken, 'findOne');
    });
    afterEach(() => {
        oAuthTokenStub.restore();
    });

    it('Should fail on missing oAuthToken', async () => {

        oAuthTokenStub.withArgs({ accessToken: 'test' }).returns({
            populate: sinon.stub().withArgs('user').returns({
                exec: sinon.stub().resolves(null)
            }),
        });
        await expect(authService.validateAccessToken('test'))
            .rejects
            .toThrow(ForbidenError);
    });

    it('Should fail on expired token', async () => {
        oAuthTokenStub.withArgs({ accessToken: 'test' }).returns({
            populate: sinon.stub().withArgs('user').returns({
                exec: sinon.stub().resolves({
                    expiration: new Date(0),
                })
            }),
        });

        await expect(authService.validateAccessToken('test'))
            .rejects
            .toThrow(ForbidenError);
    });

    it('Should fail on missing user', async () => {
        oAuthTokenStub.withArgs({ accessToken: 'test' }).returns({
            populate: sinon.stub().withArgs('user').returns({
                exec: sinon.stub().resolves({
                    expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
                })
            }),
        });

        await expect(authService.validateAccessToken('test'))
            .rejects
            .toThrow(ForbidenError);
    });

    it('Should return user', async () => {
        oAuthTokenStub.withArgs({ accessToken: 'test' }).returns({
            populate: sinon.stub().withArgs('user').returns({
                exec: sinon.stub().resolves({
                    _id: 'test',
                    expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
                    user: {
                        _id: 'userId'
                    }
                    })
                })
        });
        const result = await authService.validateAccessToken('test');

        expect(result).toBeDefined();
        expect(result).toEqual({ _id: 'userId' });


    });
});

describe("Test generateAccessToken", () => {

    let oAuthTokenFindOneStub;
    let oAuthTokenSaveStub;

    beforeEach(() => {
        oAuthTokenFindOneStub = sinon.stub(OAuthToken, 'findOne');
        oAuthTokenSaveStub = sinon.stub(OAuthToken.prototype, 'save');
    });
    afterEach(() => {
        oAuthTokenFindOneStub.restore();
        oAuthTokenSaveStub.restore();
    });

    it('Should create a new token', async () => {


        oAuthTokenFindOneStub.withArgs({ user: 'test' }).resolves(null);

        const expected = {};
        oAuthTokenSaveStub.resolves(expected);

        const result = await authService.generateAccessToken({ _id: 'test' });

        expect(result).toEqual(expected);

        sinon.assert.calledOnce(oAuthTokenSaveStub);
        // sinon.assert.calledWith(oAuthTokenSaveStub, sinon.match.has("user", 'test'));

    });

    it('Should update existing token', async () => {
        const expected = {};
        oAuthTokenFindOneStub.withArgs({ user: 'test' }).resolves({
            expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            save: jest.fn().mockResolvedValue(expected)
        });

        const result = await authService.generateAccessToken({ _id: 'test' });

        expect(result).toEqual(expected);

    });
}
);


describe("Test refreshToken", () => {

    let oAuthTokenFindOneStub;

    beforeEach(() => {
        oAuthTokenFindOneStub = sinon.stub(OAuthToken, 'findOne');
    });
    afterEach(() => {
        oAuthTokenFindOneStub.restore();
    });

    it("Should fail on missing oAuthToken", async () => {
        oAuthTokenFindOneStub.withArgs({ refreshToken: 'Test' }).resolves(null);

        await expect(authService.refreshToken('Test'))
            .rejects
            .toThrow(UnAuthorizedError);

    });

    it("Should fail on expired token", async () => {
        oAuthTokenFindOneStub.withArgs({ refreshToken: 'Test' }).resolves({
            expiration: new Date(0)
        });

        await expect(authService.refreshToken('Test'))
            .rejects
            .toThrow(UnAuthorizedError);


    });

    it("Should return token", async () => {
        const expected = {};
        oAuthTokenFindOneStub.withArgs({ refreshToken: 'Test' }).resolves({
            expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            save: jest.fn().mockResolvedValue(expected)
        });

        const result = await authService.refreshToken('Test');

        expect(result).toEqual(expected);
    });


});


