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
const search = async ({ query, user }) => {
  const page = await requestsServiceV2.paginatedSearch({
    search: query.search,
    requestType: query.requestType,
    pageSize: Number(query.pageSize),
    pageNumber: Number(query.pageNumber),
  });

  return page;
};

const getRequest = async ({ params: { id = "" }, user }) => {
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
    showDuplicates: true,
    pageNumber: Number(query?.pageNumber) || 1,
    pageSize: Number(query?.pageSize) || 5,
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
 * Recommendation must be based on an existing one via duplicated_from
 * we will not copy html and url
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

  if (!body.duplicated_from)
    throw new ForbiddenError(
      "You need to provide a duplicated_from recommendation"
    );

  const recommendation = new Recommendation({
    field1: body.field1,
    field2: body.field2,
    field3: body.field3,
    requestType: body.requestType,
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
