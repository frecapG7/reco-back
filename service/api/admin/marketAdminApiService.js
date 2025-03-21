const {
  NotFoundError,
  UnprocessableEntityError,
} = require("../../../errors/error");
const marketService = require("../../market/marketService");
const { verifyAdmin } = require("../../validation/privilegeValidation");
const { MarketItem } = require("../../../model/market/MarketItem");
const { sanitize } = require("../../../utils/utils");
const search = async ({ query, user }) => {
  verifyAdmin(user);

  const page = await marketService.paginatedSearch({
    ...query,
    enabled: false,
  });

  return page;
};

const get = async ({ params: { id = "" }, user }) => {
  verifyAdmin(user);

  const item = await MarketItem.findById(id).populate("created_by").exec();
  if (!item) throw new NotFoundError("Market item not found");

  return {
    ...item.toJSON(),
    created_by: item.created_by.toJSON(),
    modified_by: item.modified_by?.toJSON(),
    enabled: item.enabled,
  };
};

const create = async ({ body, user }) => {
  verifyAdmin(user);

  const result = await marketService.createItem(body, user);
  return result;
};

const update = async ({
  params: { id = "" },
  body: { label, description, price, enabled, tags, icon, url },
  user,
}) => {
  verifyAdmin(user);

  const item = await MarketItem.findById(id);
  if (!item) throw new NotFoundError("Market item not found");

  item.label = label;
  item.description = sanitize(description);
  item.price = price;
  item.enabled = enabled;
  item.tags = tags;
  item.icon = icon;
  item.url = url;
  item.modified_by = user;

  return await item.save();
};

const verifyUniqueName = async ({ body: { value = "" } }) => {
  const exists = await MarketItem.exists({ name: value });
  if (exists)
    throw new UnprocessableEntityError("Market item name already exists");
};

module.exports = {
  search,
  get,
  update,
  create,
  verifyUniqueName,
};
