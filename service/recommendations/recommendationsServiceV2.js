const Recommendation = require("../../model/Recommendation");
const { ForbiddenError } = require("../../errors/error");
const { acceptedUrls } = require("../../constants");
const creditService = require("../market/creditService");
const notificationService = require("../user/notificationService");

/**
 *
 * @param {*} param0
 */
const create = async ({
  field1,
  field2,
  field3,
  html,
  url,
  requestType,
  provider,
  user,
  request,
  duplicated_from,
}) => {
  // 1 - Verify url is accepted
  if (
    acceptedUrls.filter((acceptedUrl) => url?.includes(acceptedUrl))?.length ===
    0
  )
    throw new ForbiddenError("Url not accepted");

  // 2 - Create recommendation
  const recommendation = new Recommendation({
    field1,
    field2,
    field3,
    html,
    url,
    requestType,
    provider,
    user,
    request,
    duplicated_from,
  });

  return recommendation;
};

const paginatedSearch = async ({
  requestType,
  search = "",
  showDuplicates = false,
  user,
  request,
  pageSize = 5,
  pageNumber = 1,
  sort = { created_at: -1 },
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
  const page = await Recommendation.find(filters, null, {
    skip: (pageNumber - 1) * pageSize,
    limit: pageSize,
    sort,
  })
    .populate("user title avatar name")
    .populate("duplicated_from html url")
    .exec();

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results: page,
  };
};

/**
 * Function to apply like to a recommendation
 * Recommendation author will receives credits based on user
 * @param {Recommendation} recommendation
 * @param {User} user
 * @returns {Promise<Void>}
 */
const like = async (recommendation, user) => {
  // 1.a Check if user has already liked the recommendation
  if (recommendation.isLikedBy(user._id))
    throw new ForbiddenError("User has already liked this recommendation");
  // 1.b Check if user is not recommendation's author
  if (recommendation.user._id.equals(user._id))
    throw new ForbiddenError("User cannot like his own recommendation");
  // Check on request existence ?

  // 3. Evaluate credit
  const credit = getLikeValue(recommendation, user);
  // 4. Add credit and create notification
  await Promise.all([
    creditService.addCredit(Number(credit), recommendation.user),
    notificationService.createNotification({
      to: recommendation.user,
      from: user,
      type: "like_recommendation",
    }),
  ]);
  // 5. Add like
  recommendation.likes.push(user._id);
};

/**
 * Function to apply unlike to a recommendation
 * Recommendation author will lose credits
 * @param {Recommendation} recommendation
 * @param {User} user
 * @returns {Promise<Recommendation>}
 */
const unlike = async (recommendation, user) => {
  // 1.b Check if user has already liked the recommendation
  if (!recommendation.isLikedBy(user._id))
    throw new ForbiddenError(
      `User ${user._id} has not liked recommendation ${recommendation._id}`
    );

  //3. Remove like
  recommendation.likes = recommendation.likes.filter(
    (like) => !like.equals(user._id)
  );

  // 4. Remove credit
  await recommendation.populate("user");
  const credit = getLikeValue(recommendation, user);
  await creditService.removeCredit(
    credit >= recommendation.user.balance
      ? recommendation.user.balance
      : credit,
    recommendation.user
  );

  return recommendation.save();
};

const getLikeValue = (recommendation, user) => {
  return recommendation.request.author._id.equals(user._id) ? 5 : 1;
};

module.exports = {
  create,
  paginatedSearch,
  like,
  unlike,
};
