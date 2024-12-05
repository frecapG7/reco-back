const { NotFoundError } = require("../../../errors/error");
const User = require("../../../model/User");

const purchaseService = require("../../market/purchaseService");

const { verifySelfOrAdmin } = require("../../validation/privilegeValidation");

const getPurchases = async ({ id, query, authenticatedUser }) => {
  // 1 - Verify authorization
  verifySelfOrAdmin({ userId: id, authenticatedUser });
  // 2 - Find user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError(`Cannot find user with id ${id}`);

  // 3 - Get purchases
  const results = await purchaseService.searchPurchases({
    user,
    filters: {
      ...(query?.name && { name: query?.name }),
      ...(query?.status && { status: query?.status?.split(",") }),
      ...(query?.type && { type: query?.type?.split(",") }),
    },
    page: parseInt(query?.page) || 1,
    pageSize: parseInt(query?.pageSize) || 10,
  });

  // 4 - Return purchases
  return results;
};

const getPurchase = async ({ id, purchaseId, authenticatedUser }) => {
  // 1 - Verify authorization
  verifySelfOrAdmin({ userId: id, authenticatedUser });

  // 2 - Get Purchase
  const purchase = await purchaseService.getPurchase({
    userId: id,
    purchaseId,
  });

  if (!purchase)
    throw new NotFoundError(`Cannot find purchase with id ${purchaseId}`);
  // 3 - Populate item field
  await purchase.populate("item");

  return purchase;
};

const redeemPurchase = async ({ id, purchaseId, authenticatedUser }) => {
  // 1 - Verify authorization
  verifySelfOrAdmin({ userId: id, authenticatedUser });

  // 2 - Get Purchase
  const purchase = await purchaseService.getPurchase({
    userId: id,
    purchaseId,
  });

  if (!purchase)
    throw new NotFoundError(`Cannot find purchase with id ${purchaseId}`);

  // 3 - Redeem Purchase
  await purchaseService.redeem({ purchase });
};

module.exports = {
  getPurchases,
  getPurchase,
  redeemPurchase,
};
