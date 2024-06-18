const Recommendation = require("../../model/Recommendation");

const { NotFoundError } = require("../../errors/error");
const { ObjectId } = require("mongodb");

/**
 * Search in existing recommendation with duplicate_from null
 *
 * @param {*} param0
 */
const searchRecommendations = async ({ requestType, search = "" }) => {
  const results = await Recommendation.find({
    duplicate_from: null,
    $or: [
      { field1: { $regex: search, $options: "i" } },
      { field2: { $regex: search, $options: "i" } },
      { field3: { $regex: search, $options: "i" } },
    ],
    requestType: requestType,
  })
    .limit(5)
    .sort({ created_at: -1 })
    .exec();

  return results.map((result) => ({
    id: result._id,
    field1: result.field1,
    field2: result.field2,
    field3: result.field3,
    html: result.html,
    displayName: `${result.field1} - ${result.field2}`,
    provider: result.provider,
  }));
};

module.exports = {
  searchRecommendations,
};
