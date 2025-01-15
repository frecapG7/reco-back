const Recommendation = require("../../model/Recommendation");
const Request = require("../../model/Request");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const creditService = require("../market/creditService");
const notificationService = require("../user/notificationService");
const ObjectId = require("mongoose").Types.ObjectId;

const getSort = (sort) => {
  if (sort === "likes") return { likesCount: -1 };
  else if (sort === "createdAt") return { createdAt: -1 };
  else return { likesCount: -1 };
};

const getRecommendations = async ({
  requestId,
  sorted,
  pageSize,
  pageNumber,
  authenticatedUser,
}) => {
  const skip = pageSize * (pageNumber - 1);
  const limit = pageSize;
  const sort = getSort(sorted);
  const match = { request: new ObjectId(requestId) };

  const totalResults = await Recommendation.countDocuments(match);
  const recommendations = await Recommendation.aggregate([
    {
      $addFields: {
        liked: { $in: [authenticatedUser?._id, "$likes"] },
        likesCount: { $size: "$likes" },
      },
    },
    {
      $match: match,
    },
    {
      $sort: sort,
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ]).exec();

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results: recommendations?.map((recommendation) => ({
      id: recommendation._id,
      user: {
        id: recommendation.user[0]._id,
        name: recommendation.user[0].name,
        avatar: recommendation.user[0].avatar,
      },
      field1: recommendation.field1,
      field2: recommendation.field2,
      field3: recommendation.field3,
      html: recommendation.html,
      created_at: recommendation.created_at,
      provider: {
        name: recommendation.provider?.name,
        icon: recommendation.provider?.icon,
      },
      likesCount: recommendation.likesCount,
      liked: recommendation.liked,
    })),
  };
};

/**
 * Return Recommendation by id
 * @param {String} recommendationId
 * @returns Recommendation
 */
const getRecommendation = async ({ recommendationId, authenticatedUser }) => {
  const recommendation = await Recommendation.findById(recommendationId)
    .populate("author")
    .exec();

  if (!recommendation) throw new NotFoundError("Recommendation not found");

  return {
    ...recommendation.toJSON(),
    liked: authenticatedUser
      ? recommendation.likes.includes(new ObjectId(authenticatedUser._id))
      : false,
  };
};

/**
 *
 * @param {String} requestId
 * @param {Object} the authenticated user
 * @param {JSON} data
 */
const createRecommendation = async ({ requestId, data, authenticatedUser }) => {
  const request = await Request.findById(requestId);
  if (!request) throw new NotFoundError("Request not found");
  if (request.author._id.equals(authenticatedUser._id))
    throw new ForbiddenError(
      "User cannot create a recommendation for his own request"
    );

  const newRecommendation = new Recommendation({
    request: request,
    user: authenticatedUser,
    field1: String(data.field1),
    field2: String(data.field2),
    field3: String(data.field3),
    html: String(data.html),
    url: String(data.url),
    requestType: String(request.requestType),
    ...(data.duplicate_from && { duplicate_from: data.duplicate_from }),
    ...(data.provider && { provider: data.provider }),
  });

  await creditService.removeCredit(5, authenticatedUser);
  const savedRecommendation = await newRecommendation.save();

  return {
    ...savedRecommendation.toJSON(),
    liked: false,
  };
};

const updateRecommendation = async ({
  requestId,
  recommendationId,
  data,
  authenticatedUser,
}) => {
  const recommendation = await Recommendation.findOneAndUpdate(
    {
      _id: String(recommendationId),
      user: authenticatedUser._id,
      request: String(requestId),
    },
    {
      field1: String(data.field1),
      field2: String(data.field2),
      field3: String(data.field3),
    },
    { new: true }
  );
  if (!recommendation) throw new NotFoundError("Recommendation not found");

  return {
    ...recommendation.toJSON(),
    liked: authenticatedUser
      ? recommendation.likes.includes(new ObjectId(authenticatedUser._id))
      : false,
  };
};

const deleteRecommendation = async (requestId, recommendationId, user) => {
  const recommendation = await Recommendation.findOneAndDelete({
    _id: String(recommendationId),
    user: user._id,
    request: String(requestId),
  });

  if (!recommendation) throw new NotFoundError("Recommendation not found");
};

// Function to like a recommendation
const likeRecommendation = async ({ recommendationId, authenticatedUser }) => {
  // 1.a Check if recommendation exists
  const recommendation = await Recommendation.findById(recommendationId)
    .populate("request", "author")
    .exec();
  if (!recommendation) throw new NotFoundError("Recommendation not found");
  // 1.b Check if user has already liked the recommendation
  if (recommendation.likes.includes(authenticatedUser._id))
    throw new ForbiddenError("User has already liked this recommendation");
  // 1.c Check if user is not recommendation's author
  if (recommendation.user._id.equals(authenticatedUser._id))
    throw new ForbiddenError("User cannot like his own recommendation");

  // 2. Find request
  if (!recommendation.request) throw new NotFoundError("Request not found");

  // 3. Evaluate credit
  // If the user is the author of the recommendation's request, give 5 credit
  const credit = recommendation.request.author._id.equals(authenticatedUser._id)
    ? 5
    : 1;
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

// Function to unlike a recommendation
const unlikeRecommendation = async ({
  recommendationId,
  authenticatedUser,
}) => {
  // 1. Find recommendation
  const recommendation = await Recommendation.findById(recommendationId);
  if (!recommendation) throw new NotFoundError("Recommendation not found");

  //2. Remove like
  recommendation.likes = recommendation.likes.filter(
    (like) => like !== authenticatedUser._id
  );
  //3. Remove credit ?

  //4. Return result
  const newRecommendation = await recommendation.save();
  return {
    ...newRecommendation.toJSON(),
    liked: false,
  };
};

module.exports = {
  getRecommendations,
  getRecommendation,
  createRecommendation,
  updateRecommendation,
  deletedRecommendation: deleteRecommendation,
  likeRecommendation,
  unlikeRecommendation,
};
