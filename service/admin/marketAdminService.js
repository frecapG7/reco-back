const {
  UnAuthorizedError,
  UnprocessableEntityError,
  UnSupportedTypeError,
} = require("../../errors/error");

const { MarketIcon } = require("../../model/market/MarketItem");

const createMarketItem = async ({ item, authenticatedUser }) => {
  if (authenticatedUser?.role !== "ADMIN")
    throw new UnAuthorizedError(
      `User ${authenticatedUser.id} is not authorized to create a market item`
    );

  let marketItem = null;
  switch (item?.type) {
    case "Icon":
      marketItem = createIconItem({ data: item });
      break;
    case "Title":
      marketItem = createTitleItem({ data: item });
      break;

    default:
      throw new UnSupportedTypeError(
        `Unsupported market item type ${item?.type}`
      );
  }

  marketItem.created_by = authenticatedUser;

  return await marketItem.save();
};

/********************************************************
 *                   PROTECTED FUNCTIONS                *
 * ***************************************************
 */

const createIconItem = ({ data }) => {
  if (!data.svgContent)
    throw new UnprocessableEntityException(
      "Wrong market place item body : missing svgContent"
    );

  return new MarketIcon({
    ...data,
  });
};

const createTitleItem = {};

module.exports = {
  createMarketItem,
};
