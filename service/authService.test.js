
const authService = require('./authService');
const User = require('../model/User');
const {ForbiddenError} = require('../errors/error'); 


describe('Test token generation/verification', () => {


    it('Should throw an error if token is invalid', async () => {
        await expect(authService.verifyToken('invalid token'))
            .rejects
            .toThrow(ForbiddenError);
    });


    it('Should generate a valid token', async () => {
        const user = new User();
        const token = await authService.generateToken(user);

        expect(token).toBeDefined();

        const decodedToken = authService.verifyToken(token);
        expect(user._id.equals(decodedToken)).toEqual(true);

    });


});