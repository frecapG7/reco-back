const Recommendation = require("../../model/Recommendation");
const Request = require("../../model/Request");

/**
 * Evaluate the stats of a user
 * TODO: export in a userStatsService
 * @param {*} user
 * @returns {Object} stats
 */
const getStats = async ({ user }) => {
  const [requestsCount, recommendationsCount] = await Promise.all([
    Request.countDocuments({ author: user._id }),
    Recommendation.countDocuments({ user: user._id }),
  ]);

  return {
    requestsCount,
    recommendationsCount,
  };
};

const getRequestsHistory = async ({ user, pageSize = 5 }) => {
  return Request.find({ author: user._id })
    .sort({ created_at: -1 })
    .limit(pageSize)
    .exec();
};

const getRecommendationsHistory = async ({ user, pageSize = 5 }) => {
  return Recommendation.find({ user: user._id })
    .sort({ created_at: -1 })
    .limit(pageSize)
    .exec();
};

module.exports = {
  getStats,
  getRequestsHistory,
  getRecommendationsHistory,
};
