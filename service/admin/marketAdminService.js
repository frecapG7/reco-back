const {
  UnAuthorizedError,
  UnprocessableEntityError,
  UnSupportedTypeError,
  NotFoundError,
} = require("../../errors/error");

const { MarketIcon, MarketItem } = require("../../model/market/MarketItem");

const createMarketItem = async ({ item, authenticatedUser }) => {
  await verifyUser({ user: authenticatedUser });

  let marketItem = null;
  switch (item?.type) {
    case "Icon":
      marketItem = createIconItem({ data: item });
      break;
    case "Title":
      marketItem = createTitleItem({ data: item });
      break;

    default:
      throw new UnSupportedTypeError(
        `Unsupported market item type ${item?.type}`
      );
  }

  marketItem.created_by = authenticatedUser;

  return await marketItem.save();
};

const getMarketItem = async ({ itemId, authenticatedUser }) => {
  await verifyUser({ user: authenticatedUser });

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

const createIconItem = ({ data }) => {
  if (!data.svgContent)
    throw new UnprocessableEntityException(
      "Wrong market place item body : missing svgContent"
    );

  return new MarketIcon({
    ...data,
  });
};

const createTitleItem = {};

const verifyUser = async ({ user }) => {
  if ("ADMIN" !== user?.role)
    throw new UnAuthorizedError("Only admin users are authorized");
};

module.exports = {
  createMarketItem,
  getMarketItem,
  searchItems,
};
