const marketService = require("../../market/marketService");
const creditService = require("../../market/creditService");
const { IconPurchase } = require("../../../model/purchase/IconPurchase");
const mongoose = require("mongoose");
const { UnSupportedTypeError } = require("../../../errors/error");

const getRecentsIcon = async ({ value, page, pageSize }) => {
  const result = await marketService.searchItems({
    value: value,
    type: "IconItem",
    page,
    pageSize,
  });
  return result;
};

const buyIcon = async ({ id, user }) => {
  const iconItem = await marketService.getItem({ id });

  if (iconItem.type !== "IconItem")
    throw new UnSupportedTypeError(`Item ${id} is not an IconItem`);

  const iconPurchase = await marketService.buyItem({
    marketItem: iconItem,
    user,
  });
  return iconPurchase;
};

module.exports = {
  getRecentsIcon,
  buyIcon,
};
