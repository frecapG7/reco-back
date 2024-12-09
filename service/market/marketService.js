const {
  NotFoundError,
  UnprocessableEntityError,
} = require("../../errors/error");
const { MarketItem } = require("../../model/market/MarketItem");
const mongoose = require("mongoose");
const creditService = require("./creditService");
const IconPurchase = require("../../model/purchase/IconPurchase");
const ConsumablePurchase = require("../../model/purchase/ConsumablePurchase");
const PurchaseItem = require("../../model/purchase/PurchaseItem");
const getItem = async ({ id }) => {
  const item = await MarketItem.findById(id);
  if (!item) throw new NotFoundError("Cannot find market item");

  return item;
};

const searchItems = async ({
  value,
  type,
  additional,
  page = 1,
  pageSize = 10,
}) => {
  const query = {
    ...(value && {
      $or: [
        { name: { $regex: value, $options: "i" } },
        { label: { $regex: value, $options: "i" } },
        { tags: { $in: [value] } },
      ],
    }),
    ...(type && { type }),
    ...(additional && { ...additional }),
    enabled: true,
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

const buyItem = async ({ marketItem, quantity = 1, user }) => {
  let session;
  try {
    session = await mongoose.startSession();

    session.startTransaction();

    await creditService.removeCredit(quantity * marketItem.price, user);

    let purchase = await PurchaseItem.find({
      user: user,
      item: marketItem,
    });
    if (!purchase) purchase = buildPurchaseItem(marketItem, user);

    purchase.quantity += quantity;

    const savedPurchase = await purchase.save();

    await session.commitTransaction();

    return savedPurchase;
  } catch (err) {
    if (session) await session.abortTransaction();
    throw err;
  } finally {
    if (session) await session.endSession();
  }
};

const buildPurchaseItem = (marketItem, user) => {
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

module.exports = {
  getItem,
  searchItems,
  buyItem,
};
