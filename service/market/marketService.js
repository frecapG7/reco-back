const { NotFoundError, ForbiddenError, UnprocessableEntityError } = require("../../errors/error");
const MarketItem = require("../../model/market/MarketItem");

const getItems = async ({ id }) => {
  const item = await MarketItem.findById(id);
  if (!item) throw new NotFoundError("Cannot find market item");

  if (item?.disable)
    throw new UnprocessableEntityError("Cannot read disabled item");

  return item;
};

const buyItem = async ({ id, user }) => {
  if (!user) throw new ForbiddenError("Only logged user can buy item");
};

module.exports = {
  getItems,
};
