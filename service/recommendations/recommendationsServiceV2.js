const Recommendation = require("../../model/Recommendation");
const { ForbiddenError } = require("../../errors/error");
const { acceptedUrls } = require("../../constants");

/**
 *
 * @param {*} param0
 */
const create = async ({
  field1,
  field2,
  field3,
  html,
  url,
  requestType,
  provider,
  user,
  request,
  duplicated_from,
}) => {
  // 1 - Verify url is accepted
  if (
    acceptedUrls.filter((acceptedUrl) => url?.includes(acceptedUrl))?.length ===
    0
  )
    throw new ForbiddenError("Url not accepted");

  // 2 - Create recommendation
  const recommendation = new Recommendation({
    field1,
    field2,
    field3,
    html,
    url,
    requestType,
    provider,
    user,
    request,
    duplicated_from,
  });

  return recommendation;
};

const paginatedSearch = async ({
  requestType,
  search = "",
  showDuplicates = false,
  user,
  request,
  pageSize = 5,
  pageNumber = 1,
  sort = { created_at: -1 },
}) => {
  const filters = {
    ...(!showDuplicates && { duplicate_from: null }),
    $or: [
      { field1: { $regex: search, $options: "i" } },
      { field2: { $regex: search, $options: "i" } },
      { field3: { $regex: search, $options: "i" } },
    ],
    ...(request && { request }),
    ...(user && { user }),
    ...(requestType && { requestType }),
  };

  const totalResults = await Recommendation.countDocuments(filters);
  const page = await Recommendation.find(filters, null, {
    skip: (pageNumber - 1) * pageSize,
    limit: pageSize,
    sort,
  });

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results: page,
  };
};

module.exports = {
  create,
  paginatedSearch,
};
