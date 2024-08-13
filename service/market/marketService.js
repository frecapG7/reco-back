const {
  NotFoundError,
  ForbiddenError,
  UnprocessableEntityError,
} = require("../../errors/error");
const { MarketItem } = require("../../model/market/MarketItem");

const getItems = async ({ id }) => {
  const item = await MarketItem.findById(id);
  if (!item) throw new NotFoundError("Cannot find market item");

  if (item?.disable)
    throw new UnprocessableEntityError("Cannot read disabled item");

  return item;
};

const searchItems = async ({ value, type, page = 1, pageSize = 10 }) => {
  const query = {
    ...(value && {
      $or: [
        { name: { $regex: value, $options: "i" } },
        { label: { $regex: value, $options: "i" } },
        { tags: { $in: [value] } },
      ],
    }),
    ...(type && { type }),
  };

  const totalResults = await MarketItem.countDocuments(query);
  const results = await MarketItem.find(query)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .exec();

  return {
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results,
  };
};

const buyItem = async ({ id, user }) => {
  if (!user) throw new ForbiddenError("Only logged user can buy item");
};

module.exports = {
  getItems,
  searchItems,
};
