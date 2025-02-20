const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const Recommendation = require("../../../model/Recommendation");
const recommendationsService = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");

const get = async ({ params: { id }, user }) => {
  const recommendation = await Recommendation.findById(id);
  if (!recommendation) throw new NotFoundError("Recommendation not found");

  return recommendation;
};

const search = async ({ query, user }) => {


  





};

/**
 * Create a recommendation
 * These recommendation will not be linked to request and serve as library of content
 * These way we can prevent duplicate recommendations and restrain iframely api usages
 * Written on 20/02/2025 by @frecap, trying to write cleaner code
 */
const create = async ({ body, user }) => {
  if (!user)
    throw new ForbiddenError(
      "You need to be authenticated to create a recommendation"
    );

  // Create independant recommendation
  const savedRecommendation = await recommendationsService.create({
    field1: body.field1,
    field2: body.field2,
    field3: body.field3,
    html: body.html,
    url: body.url,
    requestType: body.requestType,
    provider: body.provider,
    user,
  });

  // Credit user for creating recommendation
  await creditService.addCredit(1, user);

  // History ?

  return await savedRecommendation.save();
};

module.exports = {
  get,
  create,
};
