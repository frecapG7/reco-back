const { NotFoundError } = require("../../errors/error");
const User = require("../../model/User");
const constants = require("../../constants");


const toDto = (settings) => ({
    ...settings,
    isDefault: settings === constants.defaultSettings
});


const getSettings = async (userId) => {

    // 1 - Get user by id
    const user = await User.findById(userId);

    if (!user)
        throw new NotFoundError('User not found');

    // 2 - Return settings
    // return user.settings;
    return toDto(user.settings);
};


const updateSettings = async (userId, data) => {
    // Update user settings
    const user = await User.findByIdAndUpdate(userId, {
        settings: data,
    }, { new: true });

    if (!user)
        throw new NotFoundError('User not found');

    return toDto(user.settings);
}


const resetSettings = async (userId) => {
    // Reset user settings
    const user = await User.findByIdAndUpdate(userId, {
        settings: constants.defaultSettings,
    }, { new: true });

    if (!user)
        throw new NotFoundError('User not found');

    return toDto(user.settings);

}



module.exports = {
    getSettings,
    updateSettings,
    resetSettings
}