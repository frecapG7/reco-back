const { InvalidCreditError } = require("../../errors/error");
const User = require("../../model/User");



const addCredit = async (value, user) => {
    // 1. check user is provided
    if (!user)
        throw new InvalidCreditError('User cannot be undefined');
    // 1. add value
    user.balance += value;
    // 3. save user
    return await user.save();
}


const removeCredit = async (value, user) => {
    if (!user)
        throw new InvalidCreditError('User cannot be undefined');
    // 2.Check if credit is enough
    if (user.balance < value)
        throw new InvalidCreditError('Not enough credit');

    // 3. Remove value
    user.balance -= value;

    // 4. Save user
    return await user.save();
}



module.exports = {
    addCredit,
    removeCredit,
}