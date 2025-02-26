const Request = require("../../model/Request");

const paginatedSearch = async ({
  search = "",
  requestType = "",
  user,
  pageSize = 5,
  pageNumber = 1,
  sort = { created_at: -1 },
}) => {
  const filters = {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [search] } },
    ],
    ...(requestType && { requestType }),
    ...(user && { author: user }),
  };

  const totalResults = await Request.countDocuments(filters);
  const page = await Request.find(filters, null, {
    skip: (pageNumber - 1) * pageSize,
    limit: pageSize,
    sort,
  })
    .populate("author", "avatar name title")
    .exec();

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
  paginatedSearch,
};
