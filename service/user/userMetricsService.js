const Request = require("../../model/Request");
const Recommendation = require("../../model/Recommendation");
const PurchaseItem = require("../../model/purchase/PurchaseItem");

const getRequestsMetrics = async (user) => {
  const [
    requestsCount,
    bookRequestsCount,
    songRequestsCount,
    movieRequestsCount,
  ] = await Promise.all([
    Request.countDocuments({ author: user }),
    Request.countDocuments({
      author: user,
      requestType: "BOOK",
    }),
    Request.countDocuments({
      author: user,
      requestType: "SONG",
    }),
    Request.countDocuments({
      author: user,
      requestType: "MOVIE",
    }),
  ]);

  return {
    books: bookRequestsCount,
    songs: songRequestsCount,
    movies: movieRequestsCount,
    total: requestsCount,
  };
};

const getRecommendationsMetrics = async (user) => {
  const [
    recommendationsCount,
    bookRecommendationsCount,
    songRecommendationsCount,
    movieRecommendationsCount,
  ] = await Promise.all([
    Recommendation.countDocuments({ user }),
    Recommendation.countDocuments({
      user,
      requestType: "BOOK",
    }),
    Recommendation.countDocuments({
      user,
      requestType: "SONG",
    }),
    Recommendation.countDocuments({
      user,
      requestType: "MOVIE",
    }),
  ]);

  return {
    books: bookRecommendationsCount,
    songs: songRecommendationsCount,
    movies: movieRecommendationsCount,
    total: recommendationsCount,
  };
};

const getLikes = async (user) => {
  const [recommendationsLikedCount, totalLikes] = await Promise.all([
    Recommendation.countDocuments({ likes: user }),
    Recommendation.aggregate([
      { $match: { user } }, // Match recommendations by the user
      { $project: { likeCount: { $size: "$likes" } } }, // Get the count of likes for each recommendation
      { $group: { _id: null, totalLikes: { $sum: "$likeCount" } } }, // Sum up the like counts
    ]),
  ]);
  return {
    recommendationsLikedCount,
    totalLikes: totalLikes?.length ? totalLikes[0].totalLikes : 0,
  };
};

const getPuchasesMetrics = async (user) => {
  const [lastPurchase, totalPurchasesAmount, totalPurchasesCount] =
    await Promise.all([
      PurchaseItem.findOne({ user })
        .sort({ "payment_details.purchased_at": -1 })
        .exec(),
      PurchaseItem.aggregate([
        { $match: { user } },
        { $group: { _id: null, total: { $sum: "$payment_details.price" } } },
      ]),
      PurchaseItem.countDocuments({ user }),
    ]);

  return {
    total: totalPurchasesCount,
    amount: totalPurchasesAmount.length ? totalPurchasesAmount[0].total : 0,
    last: {
      amount: lastPurchase?.payment_details.price || 0,
      date: lastPurchase?.payment_details.purchased_at || null,
    },
  };
};
const getMetrics = async (user) => {
  const [requests, recommendations, likes, purchases] = await Promise.all([
    getRequestsMetrics(user),
    getRecommendationsMetrics(user),
    getLikes(user),
    getPuchasesMetrics(user),
  ]);

  return {
    requests,
    recommendations,
    likes,
    purchases,
  };
};

module.exports = {
  getMetrics,
};
