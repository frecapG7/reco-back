const {
  UnAuthorizedError,
  UnprocessableEntityError,
  UnSupportedTypeError,
  NotFoundError,
} = require("../../errors/error");

const { verifyAdmin } = require("../validation/privilegeValidation");

const { MarketIcon, MarketItem } = require("../../model/market/MarketItem");

const createIconItem = async ({ data, authenticatedUser }) => {
  verifyAdmin(authenticatedUser);

  await verifyUniqueName(data?.name);

  if (!data.url)
    throw new UnprocessableEntityError(
      "Wrong market place item body : missing url"
    );

  const marketIcon = new MarketIcon({
    ...data,
    created_by: authenticatedUser,
  });

  return await marketIcon.save();
};

const getMarketItem = async ({ itemId, authenticatedUser }) => {
  verifyAdmin(authenticatedUser);

  const item = await MarketItem.findById(itemId);
  if (!item) throw new NotFoundError("Cannot find user");

  return item;
};

/**
 * Admin search for all market items
 * @param {String} value - search value
 * @param {String} type - search type
 * @param {Number} page - page number
 * @param {Number} pageSize - page size
 */
const searchItems = async ({ value, type, page = 1, pageSize = 25 }) => {
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
    .populate("created_by")
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

/********************************************************
 *                   PROTECTED FUNCTIONS                *
 * ***************************************************
 */
const verifyUniqueName = async (name) => {
  const exists = await MarketItem.exists({ name });

  if (exists)
    throw new UnprocessableEntityError("Market item name already exists");
};

module.exports = {
  createIconItem,
  getMarketItem,
  searchItems,
};
