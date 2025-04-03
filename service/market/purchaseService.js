const { UnprocessableEntityError } = require("../../errors/error");
const ConsumablePurchase = require("../../model/purchase/ConsumablePurchase");
const IconPurchase = require("../../model/purchase/IconPurchase");
const PurchaseItem = require("../../model/purchase/PurchaseItem");
const User = require("../../model/User");

const paginatedSearch = async ({
  search = "",
  user,
  type = "",
  pageSize = 10,
  pageNumber = 1,
  sort = "payment_details.purchased_at",
  order = "asc",
}) => {
  const query = {
    ...(user && { user }),
    name: { $regex: search, $options: "i" },
    ...(type?.length > 0 && { type: { $in: type } }),
  };

  const totalResults = await PurchaseItem.countDocuments(query);
  const results = await PurchaseItem.find(query, null, {
    skip: (pageNumber - 1) * pageSize,
    limit: pageSize,
    sort: { [sort]: order === "asc" ? 1 : -1 },
  })
    .populate("item")
    .exec();

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results,
  };
};

const redeem = async (purchase) => {
  switch (purchase.type) {
    case "IconPurchase":
      await purchase.populate("user");
      const user = purchase.user;
      user.avatar = purchase.icon;
      await user.save();
      break;
    case "ConsumablePurchase":
      // TODO: might depend of consumable type
      break;
    default:
      throw new Error(`Invalid purchase type ${purchase.type}`);
  }
};

/**
 * Will either return an existing purchase made on the same item by the same user
 * or create a new purchase based on the market item
 * @param {MarketItem}} param0
 * @returns
 */
const getPurchaseItemFromMarketItem = async (
  { _id, name, icon, type, price },
  user
) => {
  const existingPurchase = await PurchaseItem.findOne({
    item: _id,
    user,
  });
  if (existingPurchase) return existingPurchase;

  const basePurchase = {
    name: name,
    item: _id,
    payment_details: {
      price: price,
    },
    user,
  };

  switch (type) {
    case "IconItem":
      return new IconPurchase({
        ...basePurchase,
        icon: icon,
      });
    case "ConsumableItem":
      return new ConsumablePurchase(basePurchase);
    default:
      throw new UnprocessableEntityError(`Invalid item type ${type}`);
  }
};

const checkPurchaseAvailability = async (name, type, user) => {
  if (!user) return false;

  return await PurchaseItem.exists({
    name,
    type,
    user: user,
  });
};

module.exports = {
  paginatedSearch,
  redeem,
  getPurchaseItemFromMarketItem,
  checkPurchaseAvailability,
};
