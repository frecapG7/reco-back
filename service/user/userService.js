const { NotFoundError, ForbiddenError } = require("../../errors/error");
const User = require("../../model/User");

const userValidation = require("../validation/userValidation");
const tokenValidation = require("../validation/tokenValidation");

const tokenService = require("../token/tokenService");

const mongoose = require("mongoose");

const historyService = require("./usersHistoryService");

const getUser = async ({ id }) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  // 2 - Get stats
  const statistics = await historyService.getStats({ user });

  return {
    id: user._id,
    name: user.name,
    title: user.title,
    avatar: user.avatar,
    balance: user.balance,
    created: user.created,
    statistics,
    privacy: {
      showRequests: !user.settings.privacy.privateRequests,
      showRecommendations: !user.settings.privacy.privateRecommendations,
      showPurchaseHistory: !user.settings.privacy.privatePurchases,
    },
  };
};

const createUser = async (data, tokenValue) => {
  //1 - Apply validations
  await Promise.all([
    userValidation.validateEmailUnicity(data.email),
    userValidation.validateUsernameUnicity(data.name),
    tokenValidation.validateToken(tokenValue),
  ]);

  // 2 - Open transaction
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 3 - a - Burn token
    const token = await tokenService.getToken(tokenValue);
    if (token.type !== "ACCOUNT_CREATION")
      throw new ForbiddenError("Invalid token");
    await tokenService.flagAsUsed(token);

    const newUser = new User({
      name: data.name,
      email: data.email,
    });
    // 3 - b - Create user
    newUser.setPassword(data.password);
    const savedUser = await newUser.save();
    await session.commitTransaction();
    return savedUser;
  } catch (err) {
    await session?.abortTransaction();
    throw err;
  } finally {
    await session?.endSession();
  }
};

const updateUser = async (id, data) => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      name: data.name,
      email: data.email,
    },
    { new: true }
  );
  if (!updatedUser) throw new NotFoundError("User not found");

  return updatedUser;
};

const getLastRequests = async ({ id }) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  if (user.settings.privacy.privateRequests)
    throw new ForbiddenError("User requests are private");

  // 2 - Get last requests
  return await historyService.getRequestsHistory({ user });
};

const getLastRecommendations = async ({ id }) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  if (user.settings.privacy.privateRequests)
    throw new ForbiddenError("User requests are private");

  // 2 - Get last requests
  return await historyService.getRecommendationsHistory({ user });
};

module.exports = {
  getUser,
  createUser,
  updateUser,
  getLastRequests,
  getLastRecommendations,
};
