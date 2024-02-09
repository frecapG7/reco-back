const { NotFoundError, ForbiddenError } = require('../../errors/error');
const User = require('../../model/User');

const userValidation = require('../validation/userValidation');
const tokenValidation = require('../validation/tokenValidation');

const tokenService = require('../token/tokenService');

const mongoose = require('mongoose');



const getUser = async (id) => {
    const user = await User.findById(id);
    if (!user)
        throw new NotFoundError('User not found');
    return user;

}

const createUser = async (data, tokenValue) => {

    //1 - Apply validations
    await Promise.all([
        userValidation.validateEmailUnicity(data.email),
        userValidation.validateUsernameUnicity(data.name),
        tokenValidation.validateToken(tokenValue)
    ]);

    // 2 - Open transaction
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 3 - a - Burn token
        const token = await tokenService.getToken(tokenValue);
        if(token.type !== 'ACCOUNT_CREATION')
            throw new ForbiddenError('Invalid token');
        await tokenService.flagAsUsed(token);

        const newUser = new User({
            name: data.name,
            email: data.email,
        });
        // 3 - b - Create user
        newUser.setPassword(data.password);
        const savedUser = await newUser.save();
        await session.commitTransaction();
        return savedUser;
    } catch (err) {
        await session?.abortTransaction();
        throw err;
    } finally {
        await session?.endSession();
    }


}

const updateUser = async (id, data) => {
    const updatedUser = await User.findByIdAndUpdate(id,
        {
            name: data.name,
            email: data.email,
        }, { new: true });
    if (!updatedUser)
        throw new NotFoundError('User not found');

    return updatedUser;

}



module.exports = {
    getUser,
    createUser,
    updateUser,
}