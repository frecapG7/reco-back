const {
  NotFoundError,
  UnprocessableEntityError,
} = require("../../errors/error");
const {
  MarketItem,
  MarketIcon,
  MarketConsumable,
  MarketProvider,
} = require("../../model/market/MarketItem");
const { sanitize } = require("../../utils/utils");

const getItem = async ({ id }) => {
  const item = await MarketItem.findById(id);
  if (!item) throw new NotFoundError(`Cannot find market item with id ${id}`);

  return item;
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
    case "ProviderItem":
      return await createProviderItem(data, user);
    default:
      throw new UnprocessableEntityError("Invalid item type");
  }
};

const createIconItem = async (
  { name, label, description, price, tags, icon },
  user
) => {
  await verifyUniqueName(name);
  if (!icon)
    throw new UnprocessableEntityError(
      "Wrong market place item body : missing icon"
    );

  const marketIcon = new MarketIcon({
    name,
    label,
    description: sanitize(description),
    icon,
    price,
    tags,
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

const createProviderItem = async (
  { name, label, description, price, icon },
  user
) => {
  await verifyUniqueName(name);

  const marketIcon = new MarketProvider({
    name,
    label,
    i18nDescription: {
      en: sanitize(description?.en),
      fr: sanitize(description?.fr),
    },
    icon,
    price,
    created_by: user,
    modified_by: user,
  });
  return await marketIcon.save();
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
  paginatedSearch,
  createItem,
};
