const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const Request = require("../../../model/Request");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");

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
      liked: user && recommendation.isLikedBy(user),
    })),
  };
};

const createRecommendation = async ({ params: { requestId }, body, user }) => {
  if (!user)
    throw new ForbiddenError(
      "You need to be authenticated to create a recommendation"
    );

  const request = await Request.findById(requestId);
  if (!request) throw new NotFoundError("Request not found");

  if (!body.duplicated_from)
    throw new ForbiddenError(
      "Should we allow new recommendations creation here ?"
    );

  const recommendation = await recommendationsServiceV2.create({
    ...body,
    user,
    request,
  });
  await creditService.removeCredit(5, user);

  return recommendation.save();
};

module.exports = {
  getRecommendations,
  createRecommendation,
};
