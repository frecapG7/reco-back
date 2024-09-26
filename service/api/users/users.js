const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const User = require("../../../model/User");

const historyService = require("../../user/usersHistoryService");

const getUser = async ({ id, authenticatedUser }) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  // 2 - Get stats
  const statistics = await historyService.getStats({ user });

  const isSelf = authenticatedUser && authenticatedUser._id.equals(user._id);

  return {
    id: user._id,
    name: user.name,
    title: user.title,
    avatar: user.avatar,
    balance: user.balance,
    created: user.created,
    statistics,
    privacy: {
      showRequests: isSelf || !user.settings.privacy.privateRequests,
      showRecommendations:
        isSelf || !user.settings.privacy.privateRecommendations,
      showPurchaseHistory: isSelf || !user.settings.privacy.privatePurchases,
    },
  };
};

const getLastRequests = async ({ id, authenticatedUser }) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  if (
    !user._id.equals(authenticatedUser?._id) &&
    user.settings.privacy.privateRequests
  )
    throw new ForbiddenError("User requests are private");

  // 2 - Get last requests
  return await historyService.getRequestsHistory({ user });
};

const getLastRecommendations = async ({ id, authenticatedUser }) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  if (
    !user._id.equals(authenticatedUser?._id) &&
    user.settings.privacy.privateRequests
  )
    throw new ForbiddenError("User requests are private");

  // 2 - Get last requests
  return await historyService.getRecommendationsHistory({ user });
};

module.exports = {
  getUser,
  getLastRequests,
  getLastRecommendations,
};
