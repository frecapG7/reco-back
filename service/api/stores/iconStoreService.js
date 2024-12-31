const marketService = require("../../market/marketService");
const {
  UnSupportedTypeError,
  UnprocessableEntityError,
} = require("../../../errors/error");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");

const getRecentsIcon = async ({ value, page, pageSize }) => {
  const result = await marketService.searchItems({
    value: value,
    type: "IconItem",
    page,
    pageSize,
  });
  return result;
};

const getIcon = async ({ id, authenticatedUser }) => {
  // 1 - Get item
  const iconItem = await marketService.getItem({ id });
  verifyIcon(iconItem);

  const purchase =
    authenticatedUser &&
    (await PurchaseItem.findOne({
      user: authenticatedUser,
      item: iconItem,
    }));

  return {
    ...iconItem.toJSON(),
    hasPurchased: !!purchase,
    hasQuantity: purchase?.quantity || 0,
  };
};

const verifyIcon = (iconItem) => {
  if (iconItem.type !== "IconItem")
    throw new UnSupportedTypeError(`Item ${iconItem._id} is not an IconItem`);

  if (!iconItem?.enabled)
    throw new UnprocessableEntityError("Cannot read disabled icon");
};

module.exports = {
  getRecentsIcon,
  getIcon,
};
