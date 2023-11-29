const { NotFoundError, ForbiddenError } = require('../errors/error');
const User = require('../model/User');



const getUser = async (id) => {
    const user = await User.findById(id);
    if (!user)
        throw new NotFoundError('User not found');
    return user;

}

const createUser = async (data) => {

    const existingUser = await User.findOne({
        $or: [
            { email: data.email },
            { name: data.name }
        ]
    });
    if (existingUser)
        throw new ForbiddenError('User already exists');

    const newUser = new User({
        name: data.name,
        email: data.email,
    });
    newUser.setPassword(data.password);
    const savedUser = await newUser.save();
    return savedUser;
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