const { UnSupportedTypeError } = require("../../../errors/error");
const marketService = require("../../market/marketService");

const getConsumableItems = async () => {
  const result = await marketService.searchItems({
    type: "ConsumableItem",
    page: 1,
    pageSize: 15,
  });
  return result;
};

const buyConsumable = async ({ id, authenticatedUser }) => {
  const consumableItem = await marketService.getItem({ id });

  if (consumableItem.type !== "ConsumableItem")
    throw new UnSupportedTypeError(`Item ${id} is not a ConsumableItem`);

  const purchaseItem = await marketService.buyItem({
    marketItem: consumableItem,
    user: authenticatedUser,
  });
  return purchaseItem;
};

module.exports = {
  getConsumableItems,
  buyConsumable,
};
