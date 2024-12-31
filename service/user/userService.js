const { NotFoundError, ForbiddenError } = require("../../errors/error");
const User = require("../../model/User");

const userValidation = require("../validation/userValidation");
const marketService = require("../market/marketService");
const IconPurchase = require("../../model/purchase/IconPurchase");

const createUser = async ({ name, password, confirmPassword, icon_id }) => {
  // 1 - a verify username is unique
  await userValidation.validateUsernameUnicity(name);
  // 1 - b verify password match
  if (password !== confirmPassword)
    throw new ForbiddenError("password do not match");

  // 1 - c verify icon
  //TODO: use default field in the model
  const iconItem = await marketService.getItem({ id: icon_id });
  if (
    iconItem.type !== "IconItem" ||
    !iconItem.enabled ||
    !iconItem.freeOnSignup
  )
    throw new ForbiddenError("Invalid icon");

  // 2 - Create user
  const newUser = new User({
    name,
    avatar: iconItem.url,
  });
  newUser.setPassword(password);
  const savedUser = await newUser.save();

  // 3 - Attach purchase
  const purchase = new IconPurchase({
    name: iconItem.name,
    user: savedUser._id,
    item: iconItem._id,
    icon: iconItem.url,
    payment_details: {
      price: 0,
      details: "Free on signup",
    },
  });
  await purchase.save();

  return savedUser;
};

const updateUser = async (id, data) => {
  const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
  if (!updatedUser) throw new NotFoundError("User not found");

  return updatedUser;
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
