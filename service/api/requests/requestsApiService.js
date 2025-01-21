const { NotFoundError } = require("../../../errors/error");
const Request = require("../../../model/Request");
const recommendationsService = require("../../recommendations/recommendationsService");

const getRecommendations = async ({ requestId, query, authenticatedUser }) => {
  const request = await Request.findById(requestId);
  if (!request) throw new NotFoundError("Request not found");

  const page = await recommendationsService.searchRecommendations({
    request,
    authenticatedUser,
    pageNumber: Number(query?.pageNumber) || 1,
    pageSize: Number(query?.pageSize) || 5,
  });
  return page;
};

module.exports = {
  getRecommendations,
};
