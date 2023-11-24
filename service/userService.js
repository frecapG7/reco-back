const { NotFoundError } = require('../errors/error');
const User = require('../model/User');



const getUser = async (id) => {
    const user = await User.findById(id);
    if (!user)
        throw new NotFoundError('User not found');
    return user;

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
    updateUser,
}