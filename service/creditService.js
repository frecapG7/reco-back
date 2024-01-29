const { InvalidCreditError } = require("../errors/error");
const User = require("../model/User");



const addCredit = async (value, userId) => {
    // 1. find user
    const user = await User.findById(userId);
    if (!user)
        throw new InvalidCreditError('User not found');
    // 2. add credit
    user.credit += value;
    // 3. save user
    return await user.save();
}


const removeCredit = async (value, userId) => {
    // 1.Find user
    const user = await User.findById(userId);
    if (!user)
        throw new InvalidCreditError('User not found');
    // 2.Check if credit is enough
    if (user.credit < value)
        throw new InvalidCreditError('Not enough credit');

    // 3. Remove credit
    user.credit -= value;

    // 4. Save user
    return user.save();
}



module.exports = {
    addCredit,
    removeCredit,
}