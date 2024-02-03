const { AlreadyUsedException } = require('../../errors/error');
const User = require('../../model/User');

const validateEmailUnicity = async (email) => {


    const isExist = await User.findOne({
        email: email
    });

    if (isExist)
        throw new AlreadyUsedException('Email is already used');
}


const validateUsernameUnicity = async (name) => {
    const isExist = await User.findOne({name: name});

    if(isExist)
        throw new AlreadyUsedException('Username is already used');
}



module.exports = {
    validateEmailUnicity,
    validateUsernameUnicity
}