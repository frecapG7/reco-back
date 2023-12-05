const { NotFoundError } = require("../errors/error");
const User = require("../model/User");



const getSettings = async (userId) => {

    // 1 - Get user by id
    const user = await User.findById(userId);

    if(!user)
        throw new NotFoundError('User not found');

    // 2 - Return settings
    return user.settings;


};


const updateSettings = async (userId, data) => {
    // Update user settings
    const user = await User.findByIdAndUpdate(userId, {
        settings: data,
    }, { new: true });

    if(!user)
        throw new NotFoundError('User not found');

    return user.settings;
}




module.exports = {
    getSettings,
    updateSettings,
}