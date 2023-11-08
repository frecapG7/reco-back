
const authService = require('./authService');
const User = require('../model/User');


describe('Test token generation/verification', () => {


    it('Should generate a valid token', () => {
        const user = new User();
        const token = authService.generateToken(user);

        expect(token).toBeDefined();

        const decodedToken = authService.verifyToken(token);
        expect(user._id.equals(decodedToken)).toEqual(true);

    });


}) ;