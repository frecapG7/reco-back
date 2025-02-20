const Recommendation = require("../../model/Recommendation");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const creditService = require("../market/creditService");
const notificationService = require("../user/notificationService");

/**
 * Search in existing recommendation with duplicate_from null
 *
 * @param {*} param0
 */
const searchRecommendations = async ({
  requestType,
  search = "",
  showDuplicates = false,
  user,
  pageSize = 5,
  pageNumber = 1,
  sort = { created_at: -1 },
  request,
  authenticatedUser,
}) => {
  const filters = {
    ...(!showDuplicates && { duplicate_from: null }),
    $or: [
      { field1: { $regex: search, $options: "i" } },
      { field2: { $regex: search, $options: "i" } },
      { field3: { $regex: search, $options: "i" } },
    ],
    ...(request && { request }),
    ...(user && { user }),
    ...(requestType && { requestType }),
  };

  const totalResults = await Recommendation.countDocuments(filters);
  const pageResult = await Recommendation.find(filters)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort(sort)
    .populate("user")
    .exec();

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results: pageResult.map((result) => ({
      ...result.toJSON(),
      liked: result.isLikedBy(authenticatedUser?._id),
    })),
  };
};



/**
 * Function to apply like a recommendation
 * @param {ObjectId} recommendationId
 * @param {User} authenticatedUser
 * @returns {Promise<Recommendation>}
 */
const likeRecommendation = async ({ recommendationId, authenticatedUser }) => {
  // 1.a Check if recommendation exists
  const recommendation = await Recommendation.findById(recommendationId)
    .populate("request", "author")
    .exec();
  if (!recommendation) throw new NotFoundError("Recommendation not found");
  // 1.b Check if user has already liked the recommendation
  if (recommendation.isLikedBy(authenticatedUser._id))
    throw new ForbiddenError("User has already liked this recommendation");
  // 1.c Check if user is not recommendation's author
  if (recommendation.user._id.equals(authenticatedUser._id))
    throw new ForbiddenError("User cannot like his own recommendation");

  // 2. Find request
  if (!recommendation.request) throw new NotFoundError("Request not found");

  // 3. Evaluate credit
  const credit = getValue({ recommendation, authenticatedUser });
  // 4. Add credit and create notification
  await Promise.all([
    creditService.addCredit(Number(credit), recommendation.user),
    notificationService.createNotification({
      to: recommendation.user,
      from: authenticatedUser,
      type: "like_recommendation",
    }),
  ]);
  // 5. Add like
  recommendation.likes.push(authenticatedUser._id);

  //6. Return result
  const savedRecommendation = await recommendation.save();

  return {
    ...savedRecommendation.toJSON(),
    liked: true,
  };
};

/**
 *
 *  Function to unlike a recommendation
 * @param {ObjectId} recommendationId
 * @param {User} authenticatedUser
 * @returns {Promise<Recommendation>}
 */
const unlikeRecommendation = async ({
  recommendationId,
  authenticatedUser,
}) => {
  // 1. Find recommendation
  const recommendation = await Recommendation.findById(recommendationId)
    .populate("request", "author")
    .exec();
  if (!recommendation) throw new NotFoundError("Recommendation not found");
  // 1.b Check if user has already liked the recommendation
  if (!recommendation.isLikedBy(authenticatedUser._id))
    throw new ForbiddenError(
      `User ${authenticatedUser._id} has not liked recommendation ${recommendation._id}`
    );

  //2. Remove credit ?
  await removeCredit({
    recommendation,
    value: getValue({ recommendation, authenticatedUser }),
  });

  //3. Remove like
  recommendation.likes = recommendation.likes.filter(
    (like) => !like.equals(authenticatedUser._id)
  );

  //4. Return result
  const newRecommendation = await recommendation.save();
  return {
    ...newRecommendation.toJSON(),
    liked: false,
  };
};

/**
 *
 * If the user is the author of the recommendation's request, give 5 credit
 * @param {Recommendation} recommendation
 * @param {User} authenticatedUser
 * @returns {Number} credit
 */
const getValue = ({ recommendation, authenticatedUser }) => {
  return recommendation.request.author._id.equals(authenticatedUser._id)
    ? 5
    : 1;
};

/**
 *
 * @param {Recommendation} recommendation
 * @param {Number} value
 * @returns {Promise}
 */
const removeCredit = async ({ recommendation, value }) => {
  await recommendation.populate("user");

  await creditService.removeCredit(
    value >= recommendation.user.balance ? recommendation.user.balance : value,
    recommendation.user
  );
};

module.exports = {
  searchRecommendations,
  likeRecommendation,
  unlikeRecommendation,
};
