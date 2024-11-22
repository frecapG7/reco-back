const Recommendation = require("../../model/Recommendation");

/**
 * Search in existing recommendation with duplicate_from null
 *
 * @param {*} param0
 */
const searchRecommendations = async ({
  requestType,
  search = "",
  showDuplicates = false,
  user,
  pageSize = 5,
  pageNumber = 1,
  sort = { created_at: -1 },
}) => {
  const results = await Recommendation.find({
    ...(!showDuplicates && { duplicate_from: null }),
    $or: [
      { field1: { $regex: search, $options: "i" } },
      { field2: { $regex: search, $options: "i" } },
      { field3: { $regex: search, $options: "i" } },
    ],
    ...(user && { user }),
    ...(requestType && { requestType }),
  })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort(sort)
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
