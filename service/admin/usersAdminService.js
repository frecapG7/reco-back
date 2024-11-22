const { NotFoundError } = require("../../errors/error");
const User = require("../../model/User");

const Request = require("../../model/Request");
const Recommendation = require("../../model/Recommendation");

const { verifyAdmin } = require("../validation/privilegeValidation");

const search = async ({
  filters = {},
  pageSize = 1,
  pageNumber = 10,
  authenticatedUser,
}) => {
  verifyAdmin(authenticatedUser);

  const totalResults = await User.countDocuments();

  const results = await User.find({
    ...filters,
    _id: { $ne: authenticatedUser._id },
  })
    .skip(pageSize * (pageNumber - 1))
    .limit(pageSize)
    .exec();

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results: results?.map((result) => result.toJSON()),
  };
};

const getUserDetails = async ({ userId, authenticatedUser }) => {
  verifyAdmin(authenticatedUser);

  const user = await getUser(userId);

  const stats = await getStats(user);

  return {
    ...user.toJSON(),
    stats,
  };
};

/********************************************************
 *                   PROTECTED FUNCTIONS                *
 * ***************************************************
 */

/**
 * Evaluate the stats of a user
 * TODO: export in a userStatsService
 * @param {*} user
 * @returns {Object} stats
 */
const getStats = async (user) => {
  const [requestsCount, recommendationsCount] = await Promise.all([
    Request.countDocuments({ author: user._id }),
    Recommendation.countDocuments({ user: user._id }),
  ]);

  return {
    requestsCount,
    recommendationsCount,
    balance: user.balance,
  };
};

const getUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new NotFoundError("User not found");

  return user;
};

module.exports = {
  search,
  getUserDetails,
};
