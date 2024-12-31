const {
  UnSupportedTypeError,
  UnprocessableEntityError,
} = require("../../../errors/error");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const marketService = require("../../market/marketService");

const getConsumableItems = async () => {
  const result = await marketService.searchItems({
    type: "ConsumableItem",
    page: 1,
    pageSize: 15,
  });
  return result;
};

const getConsumable = async ({ id, authenticatedUser }) => {
  const consumableItem = await marketService.getItem({ id });
  verifyConsumable(consumableItem);

  let purchasesCount = 0;
  if (authenticatedUser)
    purchasesCount = await PurchaseItem.countDocuments({
      user: authenticatedUser,
      item: consumableItem,
    });

  return {
    ...consumableItem.toJSON(),
    hasPurchased: purchasesCount > 0,
    purchasesCount,
  };
};

const verifyConsumable = (consumableItem) => {
  if (consumableItem.type !== "ConsumableItem")
    throw new UnSupportedTypeError(
      `Item ${consumableItem._id} is not a ConsumableItem`
    );

  if (!consumableItem?.enabled)
    throw new UnprocessableEntityError("Cannot read disabled consumable");
};

module.exports = {
  getConsumableItems,
  getConsumable,
};
