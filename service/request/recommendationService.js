const Recommendation = require("../../model/Recommendation");
const Request = require("../../model/Request");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const creditService = require("../market/creditService");
const ObjectId = require("mongoose").Types.ObjectId;

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
    liked: recommendation.isLikedBy(authenticatedUser?._id),
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

module.exports = {
  getRecommendation,
  createRecommendation,
  updateRecommendation,
  deletedRecommendation: deleteRecommendation,
};
