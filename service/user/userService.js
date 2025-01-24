const { NotFoundError, ForbiddenError } = require("../../errors/error");
const User = require("../../model/User");

const userValidation = require("../validation/userValidation");

const createUser = async ({
  name,
  email,
  password,
  confirmPassword,
  defaultAvatar,
}) => {
  // 1 - a verify username is unique
  await userValidation.validateUsernameUnicity(name);
  // 1 - b verify email unicity
  await userValidation.validateEmailUnicity(email);

  // 1 - b verify password match
  if (password !== confirmPassword)
    throw new ForbiddenError("password do not match");

  // 2 - Create user
  const user = new User({
    name: name,
    email: email,
    defaultAvatar: defaultAvatar,
    avatar: defaultAvatar,
  });
  user.setPassword(password);
  return user;
};

/**
 * Merge user data
 * @param {User} user
 * @param {User} data
 */
const updateUser = async (user, { name, email, avatar }) => {
  // 1 - Update user
  user.name = name;
  user.email = email;
  user.avatar = avatar;
};

const getUser = async (id) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");
  return user;
};

module.exports = {
  createUser,
  updateUser,
  getUser,
};
