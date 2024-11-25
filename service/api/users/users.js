const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const User = require("../../../model/User");

const requestService = require("../../request/requestService");
const recommendationsService = require("../../recommendations/recommendationsService");

const getUser = async ({ id, authenticatedUser }) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  const isSelf = authenticatedUser && authenticatedUser._id.equals(user._id);

  return {
    id: user._id,
    name: user.name,
    title: user.title,
    avatar: user.avatar,
    balance: user.balance,
    created: user.created,
    privacy: {
      showRequests: isSelf || !user.settings.privacy.privateRequests,
      showRecommendations:
        isSelf || !user.settings.privacy.privateRecommendations,
      showPurchaseHistory: isSelf || !user.settings.privacy.privatePurchases,
    },
  };
};

const getRequests = async ({
  id,
  authenticatedUser,
  pageSize,
  pageNumber,
  search,
  type,
  sort,
}) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  if (
    !user._id.equals(authenticatedUser?._id) &&
    authenticatedUser?.role !== "ADMIN" &&
    user.settings.privacy.privateRequests
  )
    throw new ForbiddenError("User requests are private");

  // 2 - Get requests
  const page = await requestService.search({
    filters: {
      ...(search && { search }),
      ...(type && { requestType: type }),
      author: user,
    },
    pageSize,
    pageNumber,
  });
  return page;
};

const getRecommendations = async ({ id, query, authenticatedUser }) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  if (
    !user._id.equals(authenticatedUser?._id) &&
    authenticatedUser?.role !== "ADMIN" &&
    user.settings.privacy.privateRequests
  )
    throw new ForbiddenError("User requests are private");

  // 2 - Get last requests
  return await recommendationsService.searchRecommendations({
    requestType: query?.type,
    search: query?.search,
    showDuplicates: true,
    user,
    pageSize: parseInt(query?.pageSize),
    pageNumber: parseInt(query?.pageNumber),
    sort: getSort(query?.sort),
  });
};

const getSort = (sort) => {
  if (sort === "likes_asc") return { likes: 1 };
  if (sort === "likes_desc") return { likes: -1 };
  if (sort === "created_asc") return { created_at: 1 };
  if (sort === "created_desc") return { created_at: -1 };
  return { created_at: -1 };
};

module.exports = {
  getUser,
  getRequests,
  getRecommendations,
};
