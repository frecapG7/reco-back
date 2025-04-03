const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const Request = require("../../../model/Request");
const Recommendation = require("../../../model/Recommendation");
const requestsServiceV2 = require("../../request/requestsServiceV2");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");
const { sanitize } = require("../../../utils/utils");

/**
 * Search requests
 * @param {*} param0
 */
const search = async ({ query }) => {
  const page = await requestsServiceV2.paginatedSearch(query);
  return page;
};

const getRequest = async ({ params: { id = "" } }) => {
  const request = await Request.findById(id);
  if (!request) throw new NotFoundError("Request not found");

  await request.populate("author");
  return request;
};

const createRequest = async ({ body, user }) => {
  if (!user)
    throw new ForbiddenError(
      "You need to be authenticated to create a request"
    );

  const request = new Request({
    requestType: body.requestType,
    title: body.title,
    description: sanitize(body.description),
    tags: body.tags,
    author: user,
  });
  const saveRequest = await request.save();

  return saveRequest;
};

const getRecommendations = async ({ params: { requestId }, query, user }) => {
  const request = await Request.findById(requestId);
  if (!request) throw new NotFoundError("Request not found");

  const page = await recommendationsServiceV2.paginatedSearch({
    request,
    ...query,
  });

  await Promise.all(
    page.results.map(async (recommendation) => recommendation.populate("user"))
  );
  return {
    ...page,
    results: page.results.map((recommendation) => ({
      ...recommendation.toJSON(),
      liked: recommendation.isLikedBy(user?.id),
    })),
  };
};

/**
 * Create a new recommendation for this request
 * @param {ObjectId} id
 * @param {Recommendation} body
 * @returns
 */
const createRecommendation = async ({ params: { requestId }, body, user }) => {
  if (!user)
    throw new ForbiddenError(
      "You need to be authenticated to create a recommendation"
    );

  const request = await Request.findById(requestId);
  if (!request) throw new NotFoundError("Request not found");

  const recommendation = new Recommendation({
    ...body,
    requestType: request.requestType,
    user,
    request,
  });
  await creditService.removeCredit(5, user);

  request.recommendationsCount += 1;
  await request.save();

  return recommendation.save();
};

module.exports = {
  search,
  getRequest,
  createRequest,
  getRecommendations,
  createRecommendation,
};
