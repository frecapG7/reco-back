const {
  NotFoundError,
  UnprocessableEntityError,
} = require("../../errors/error");
const {
  MarketItem,
  MarketIcon,
  MarketConsumable,
} = require("../../model/market/MarketItem");
const creditService = require("./creditService");
const IconPurchase = require("../../model/purchase/IconPurchase");
const ConsumablePurchase = require("../../model/purchase/ConsumablePurchase");
const PurchaseItem = require("../../model/purchase/PurchaseItem");
const { sanitize } = require("../../utils/utils");

const getItem = async ({ id }) => {
  const item = await MarketItem.findById(id);
  if (!item) throw new NotFoundError(`Cannot find market item with id ${id}`);

  return item;
};

const buyItem = async ({ marketItem, quantity = 1, user }) => {
  let purchase = await PurchaseItem.findOne({
    user: user,
    item: marketItem,
  });

  if (!purchase) purchase = await buildPurchaseItem(marketItem, user);

  await creditService.removeCredit(quantity * marketItem.price, user);

  purchase.quantity += quantity;

  const savedPurchase = await purchase.save();

  return savedPurchase;
};

const buildPurchaseItem = async (marketItem, user) => {
  const basePurchase = {
    name: marketItem.name,
    user: user,
    item: marketItem,
    payment_details: {
      price: marketItem.price,
    },
  };

  switch (marketItem.type) {
    case "IconItem":
      return new IconPurchase({
        ...basePurchase,
        icon: marketItem.url,
      });
    case "ConsumableItem":
      return new ConsumablePurchase(basePurchase);
    default:
      throw new UnprocessableEntityError(
        `Invalid item type ${marketItem.type}`
      );
  }
};

/**
 * V2 Service starting from 02/03/2025
 */
const paginatedSearch = async ({
  search = "",
  type = "",
  enabled = true,
  pageSize = 5,
  pageNumber = 1,
  sort = "created_at",
  order = "desc",
}) => {
  const filters = {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { tags: { $in: [search] } },
    ],
    ...(type && { type }),
    ...(enabled && { enabled: true }),
  };

  const totalResults = await MarketItem.countDocuments(filters);
  const results = await MarketItem.find(filters, null, {
    skip: (pageNumber - 1) * pageSize,
    limit: pageSize,
    sort: { [sort]: order === "asc" ? 1 : -1 },
  });

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results,
  };
};

const createItem = async (data, user) => {
  switch (data?.type) {
    case "IconItem":
      return await createIconItem(data, user);
    case "ConsumableItem":
      return await createConsumableItem(data, user);
    default:
      throw new UnprocessableEntityError("Invalid item type");
  }
};

const createIconItem = async (
  { name, label, description, price, tags, url },
  user
) => {
  await verifyUniqueName(name);
  if (!url)
    throw new UnprocessableEntityError(
      "Wrong market place item body : missing url"
    );

  const marketIcon = new MarketIcon({
    name,
    label,
    description: sanitize(description),
    price,
    tags,
    url,
    created_by: user,
    modified_by: user,
  });
  return await marketIcon.save();
};

const createConsumableItem = async (
  { name, label, description, price, tags, icon, consumableType },
  user
) => {
  await verifyUniqueName(name);
  await verifyUniqueConsumableType(consumableType);

  const marketConsumable = new MarketConsumable({
    name,
    label,
    description: sanitize(description),
    price,
    tags,
    icon,
    consumableType,
    created_by: user,
    modified_by: user,
  });

  return await marketConsumable.save();
};

const verifyUniqueName = async (name, id) => {
  const exists = await MarketItem.exists({
    name,
    ...(id && { _id: { $ne: id } }),
  });

  if (exists)
    throw new UnprocessableEntityError("Market item name already exists");
};

const verifyUniqueConsumableType = async (consumableType) => {
  const exists = await MarketItem.exists({
    type: "ConsumableItem",
    consumableType,
  });

  if (exists)
    throw new UnprocessableEntityError("Consumable item type already exists");
};

module.exports = {
  getItem,
  buyItem,
  paginatedSearch,
  createItem,
};
