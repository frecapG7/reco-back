const PurchaseItem = require("../../model/purchase/PurchaseItem");

const searchPurchases = async ({
  user,
  filters = {
    name: "",
    type: [],
    status: [],
  },
  sort = "-createdAt",
  page = 1,
  pageSize = 10,
}) => {
  const query = {
    user,
    ...(filters.name?.length > 0 && {
      name: { $regex: filters.name, $options: "i" },
    }),
    ...(filters.type?.length > 0 && { type: { $in: filters.type } }),
    ...(filters.status?.length > 0 && { status: { $in: filters.status } }),
  };

  const totalResults = await PurchaseItem.countDocuments(query);
  const results = await PurchaseItem.find(query)
    .sort(sort)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .exec();

  return {
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results,
  };
};

const getPurchase = async ({ userId, purchaseId }) => {
  const purchase = await PurchaseItem.findOne({
    user: userId,
    _id: purchaseId,
  }).exec();
  return purchase;
};

module.exports = {
  searchPurchases,
  getPurchase,
};
