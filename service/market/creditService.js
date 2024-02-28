const { InvalidCreditError } = require("../../errors/error");
const User = require("../../model/User");



const addCredit = async (value, user) => {

    const dbUser = await User.findById(user._id);

    // 1. check user is provided
    if (!dbUser)
        throw new InvalidCreditError('User cannot be undefined');
    // 1. add value
    dbUser.balance += value;
    // 3. save user
    return await dbUser.save();
}


const removeCredit = async (value, user) => {
    const dbUser = await User.findById(user._id);
    // 1. check user is provided
    if (!dbUser)
        throw new InvalidCreditError('User cannot be undefined');
    // 2.Check if credit is enough
    if (dbUser.balance < value)
        throw new InvalidCreditError('Not enough credit');

    // 3. Remove value
    dbUser.balance -= value;

    // 4. Save user
    return await dbUser.save();
}



module.exports = {
    addCredit,
    removeCredit,
}