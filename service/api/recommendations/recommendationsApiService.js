const {
  NotFoundError,
  ForbiddenError,
  UnprocessableEntityError,
} = require("../../../errors/error");
const Recommendation = require("../../../model/Recommendation");
const recommendationsService = require("../../recommendations/recommendationsServiceV2");
const purchaseService = require("../../market/purchaseService");
const openlibraryService = require("../../recommendations/openlibraryService");
const googleBookService = require("../../embed/googleBookService");
const soundcloudService = require("../../embed/soundcloudService");
const deezerService = require("../../embed/deezerService");
const { providers } = require("../../../constants");

const get = async ({ params: { id }, user }) => {
  const recommendation = await Recommendation.findById(id)
    .populate("user", "title avatar name")
    .exec();
  if (!recommendation) throw new NotFoundError("Recommendation not found");

  return recommendation;
};

const search = async ({
  query: { search = "", pageSize = 10, provider = "", requestType = "" },
  user,
}) => {
  switch (requestType) {
    case "BOOK":
      if (provider === "GOOGLEBOOKS")
        return await googleBookService.search(search, pageSize);
      return await openlibraryService.search(search, pageSize);
    case "SONG":
      if (provider === "SOUNDCLOUD")
        return await soundcloudService.search(search, pageSize);
      return deezerService.search(search, pageSize);
    default:
      throw new UnprocessableEntityError("Request type not supported");
  }
};

const getProviders = async ({ query: { requestType = "", user } }) => {
  if (!providers[requestType])
    throw new UnprocessableEntityError("Request type not supported");

  return await Promise.all(
    providers[requestType]?.map(async (provider) => {
      const available =
        provider.default ||
        (await purchaseService.checkPurchaseAvailability(
          provider.name,
          "ProviderPurchase",
          user
        ));
      return {
        name: provider.name,
        icon: provider.icon,
        uri: provider.uri,
        default: Boolean(provider.default),
        available,
      };
    })
  );
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
  search,
  getProviders,
  like,
  unlike,
};
