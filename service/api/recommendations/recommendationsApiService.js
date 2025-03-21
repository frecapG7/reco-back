const {
  NotFoundError,
  ForbiddenError,
  UnprocessableEntityError,
} = require("../../../errors/error");
const Recommendation = require("../../../model/Recommendation");
const recommendationsService = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");
const embedService = require("../../embed/embedService");
const logger = require("../../../logger");

const get = async ({ params: { id }, user }) => {
  const recommendation = await Recommendation.findById(id)
    .populate("user", "title avatar name")
    .exec();
  if (!recommendation) throw new NotFoundError("Recommendation not found");

  return recommendation;
};

const getFromEmbed = async ({ query: { url = "" }, user }) => {
  if (!Boolean(url)) throw new UnprocessableEntityError("Url is required");

  // Check accepted urls ?

  // Search previous recommendation using a "like" filter
  logger.debug(`Searching for existing recommendation with url ${url}`);
  const recommendation = await Recommendation.findOne({
    url: { $regex: url, $options: "i" },
  });
  if (recommendation) return recommendation;

  const embed = await embedService.getEmbed(url);

  // Search duplicate recommendation
  logger.debug(`Searching for duplicate recommendation for ${embed.title}`);
  const duplicate = await Recommendation.findOne({
    $and: [{ field1: embed.title }, { field2: embed.author }],
  });
  if (duplicate) return duplicate;

  return {
    field1: embed.title,
    field2: embed.author,
    field3: embed.description,
    provider: embed.provider,
    html: embed.html,
    url: embed.url,
  };
};

const search = async ({ query, user }) => {
  const page = await recommendationsService.paginatedSearch({
    ...query,
    showDuplicates: false,
  });

  return page;
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

  // Search for existing
  const existingRecommendation = await Recommendation.findOne({
    $or: [
      {
        $and: [
          { field1: { $regex: body.field1, $options: "i" } },
          { field2: { $regex: body.field2, $options: "i" } },
        ],
      },
      {
        url: { $regex: body.url, $options: "i" },
      },
    ],
  });
  if (existingRecommendation)
    throw new UnprocessableEntityError("Recommendation already exists");

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

/**
 * Like a recommendation
 * @param {*} param0
 */
const like = async ({ params: { id = "" }, user }) => {
  if (!user)
    throw new ForbiddenError(
      "You need to be authenticated to like a recommendation"
    );
  // 1.a Find recommendation
  const recommendation = await Recommendation.findById(id)
    .populate("request", "author")
    .exec();
  if (!recommendation) throw new NotFoundError("Recommendation not found");

  // 2 Apply like
  await recommendationsService.like(recommendation, user);

  // 3 - Save an return
  const savedRecommendation = await recommendation.save();
  return {
    ...savedRecommendation.toJSON(),
    liked: true,
  };
};

const unlike = async ({ params: { id = "" }, user }) => {
  if (!user)
    throw new ForbiddenError(
      "You need to be authenticated to unlike a recommendation"
    );
  // 1.a Find recommendation
  const recommendation = await Recommendation.findById(id)
    .populate("request", "author")
    .exec();
  if (!recommendation) throw new NotFoundError("Recommendation not found");

  // 2 Remove like
  const updatedRecommendation = await recommendationsService.unlike(
    recommendation,
    user
  );

  return {
    ...updatedRecommendation.toJSON(),
    liked: false,
  };
};

const archive = async ({ params: { id = "" }, user }) => {
  if (!user)
    throw new ForbiddenError(
      "You need to be authenticated to archive a recommendation"
    );

  // 1.a Find recommendation
  const recommendation = await Recommendation.findById(id);
  if (!recommendation) throw new NotFoundError("Recommendation not found");

  // 2 Archive recommendation
};

module.exports = {
  get,
  getFromEmbed,
  create,
  search,
  like,
  unlike,
};
