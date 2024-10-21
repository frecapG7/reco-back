const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const User = require("../../../model/User");

const purchaseService = require("../../market/purchaseService");

const getPurchases = async ({ id, query, authenticatedUser }) => {
  // 1 - Find user
  const user = await User.findById(id);

  if (!user) throw new NotFoundError(`Cannot find user with id ${id}`);

  // 2 - Verify authorization
  if (
    !user._id.equals(authenticatedUser?.id) &&
    user.settings.privacy.privateRequests
  )
    throw new ForbiddenError("User purchases are private");

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

const getPurchase = ({ id, purchaseId, authenticatedUser }) => {
  // 1 - Verify authorization
  if (!authenticatedUser?._id.equals(id) && authenticatedUser?.role !== "ADMIN")
    throw new ForbiddenError(
      `User ${authenticatedUser?._id} is not allowed to see this purchase`
    );

  // 2 - Get Purchase
  const purchase = purchaseService.getPurchase({
    userId: id,
    purchaseId,
  });

  return purchase;
};

module.exports = {
  getPurchases,
  getPurchase,
};
