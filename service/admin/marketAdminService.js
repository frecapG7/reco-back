const {
  UnAuthorizedError,
  UnprocessableEntityError,
  UnSupportedTypeError,
  NotFoundError,
} = require("../../errors/error");

const { MarketIcon, MarketItem } = require("../../model/market/MarketItem");

const createMarketItem = async ({ item, authenticatedUser }) => {
  await verifyUser({ user: authenticatedUser });

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

const getMarketItem = async ({ itemId, authenticatedUser }) => {
  await verifyUser({ user: authenticatedUser });

  const item = await MarketItem.findById(itemId);
  if (!item) throw new NotFoundError("Cannot find user");

  return item;
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

const verifyUser = async ({ user }) => {
  if ("ADMIN" !== user?.role)
    throw new UnAuthorizedError("Only admin users are authorized");
};

module.exports = {
  createMarketItem,
  getMarketItem,
};
