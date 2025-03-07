const { NotFoundError } = require("../../../errors/error");
const { MarketItem } = require("../../../model/market/MarketItem");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const marketService = require("../../market/marketService");

const search = async ({ query }) => {
  const page = await marketService.paginatedSearch({
    ...query,
    enabled: true,
  });
  return page;
};

const getByName = async ({ params: { name = "" }, user }) => {
  const marketItem = await MarketItem.findOne({
    name,
    enabled: true,
  });
  if (!marketItem) throw new NotFoundError(`Item ${name} not found`);

  let hasPurchased = false;
  if (user)
    hasPurchased = await PurchaseItem.exists({
      user,
      item: marketItem,
    });

  return {
    ...marketItem.toJSON(),
    hasPurchased,
  };
};

module.exports = {
  search,
  getByName,
};
