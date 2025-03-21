const { NotFoundError } = require("../../../errors/error");
const User = require("../../../model/User");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");

const purchaseService = require("../../market/purchaseService");
const creditService = require("../../market/creditService");
const { verifySelfOrAdmin } = require("../../validation/privilegeValidation");
const { MarketItem } = require("../../../model/market/MarketItem");

const getPurchases = async ({ params: { userId = "" }, query, user }) => {
  // 1 - Verify authorization
  verifySelfOrAdmin({ userId, authenticatedUser: user });

  // 3 - Get purchases
  const results = await purchaseService.paginatedSearch({
    ...query,
    user: userId,
  });

  // 4 - Return purchases
  return results;
};

const getPurchase = async ({
  params: { userId = "", purchaseId = "" },
  user,
}) => {
  // 1 - Verify authorization
  verifySelfOrAdmin({ userId, authenticatedUser: user });

  // 2 - Get Purchase
  const purchase = await PurchaseItem.findOne({
    _id: purchaseId,
    user: userId,
  })
    .populate("item")
    .exec();

  if (!purchase)
    throw new NotFoundError(`Cannot find purchase with id ${purchaseId}`);

  return purchase;

  // return {
  //   ...purchase.toJSON(),
  //   ...(purchase.type === "IconPurchase" && {
  //     hasEquipped: purchase?.icon === authenticatedUser.avatar,
  //   }),
  // };
};

const redeemPurchase = async ({
  params: { userId = "", purchaseId = "" },
  user,
}) => {
  // 1 - Verify authorization
  verifySelfOrAdmin({ userId, authenticatedUser: user });

  // 2 - Get Purchase
  const purchase = await PurchaseItem.findOne({
    _id: purchaseId,
    user: userId,
  });
  if (!purchase)
    throw new NotFoundError(`Cannot find purchase with id ${purchaseId}`);

  // 3 - Redeem Purchase
  await purchaseService.redeem(purchase);

  // 4 - Return
  return purchase;
};

const createPurchase = async ({
  params: { userId = "" },
  body: { item, quantity = 1 },
  user,
}) => {
  // 1 - Verify authorization
  verifySelfOrAdmin({ userId, authenticatedUser: user });

  // verify user
  const purchaseUser = await User.findById(userId);
  if (!purchaseUser)
    throw new NotFoundError(`Cannot find user with id ${userId}`);

  // 2 - Retrieve and check StoreItem
  const marketItem = await MarketItem.findById(item?.id);
  if (!marketItem?.enabled)
    throw new NotFoundError(`Cannot find store item with id ${item?.id}`);

  // 3 - Get PurchaseItem
  const purchase = await purchaseService.getPurchaseItemFromMarketItem(
    marketItem,
    purchaseUser
  );
  purchase.quantity += quantity;

  // 4 - Remove credit from user
  await creditService.removeCredit(marketItem.price * quantity, purchaseUser);

  // 4 - Return purchase
  return await purchase.save();
};

module.exports = {
  getPurchases,
  getPurchase,
  redeemPurchase,
  createPurchase,
};
