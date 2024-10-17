const {
  UnprocessableEntityError,
  NotFoundError,
} = require("../../errors/error");

const { verifyAdmin } = require("../validation/privilegeValidation");

const {
  MarketIcon,
  MarketItem,
  MarketConsumable,
} = require("../../model/market/MarketItem");

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

const createConsumableItem = async ({ data, authenticatedUser }) => {
  verifyAdmin(authenticatedUser);

  await verifyUniqueConsumableType(data?.consumableType);

  const marketConsumable = new MarketConsumable({
    ...data,
    created_by: authenticatedUser,
  });

  return await marketConsumable.save();
};

const updateItem = async ({ id, data, authenticatedUser }) => {
  verifyAdmin(authenticatedUser);

  await verifyUniqueName(data?.name, id);

  const updatedItem = await MarketItem.findByIdAndUpdate(
    id,
    {
      ...data,
      modified_by: authenticatedUser,
    },
    { new: true }
  );

  if (!updatedItem) throw new NotFoundError("Cannot find market item");

  return updatedItem;
};

const getMarketItem = async ({ itemId, authenticatedUser }) => {
  verifyAdmin(authenticatedUser);

  const item = await MarketItem.findById(itemId)
    .populate("created_by")
    .populate("modified_by")
    .exec();
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
const verifyUniqueName = async (name, id) => {
  const exists = await MarketItem.exists({
    name,
    ...(id && { _id: { $ne: id } }),
  });

  if (exists)
    throw new UnprocessableEntityError("Market item name already exists");
};

const verifyUniqueConsumableType = async (type) => {
  const exists = await MarketItem.exists({
    type: "ConsumableItem",
    consumableType: type,
  });

  if (exists)
    throw new UnprocessableEntityError("Consumable item type already exists");
};

module.exports = {
  createIconItem,
  createConsumableItem,
  updateItem,
  getMarketItem,
  searchItems,
};
