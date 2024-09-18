const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const User = require("../../../model/User");

const getPurchases = async ({ id, authenticatedUser }) => {
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
  const results = await PurchaseItem.find({ user: user._id });

  //TODO: add pagination

  // 4 - Return purchases
  return results;
};

module.exports = {
  getPurchases,
};
