const PurchaseItem = require("../../model/purchase/PurchaseItem");
const User = require("../../model/User");

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
    .populate("item")
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

const redeem = async ({ purchase }) => {
  switch (purchase.type) {
    case "IconPurchase":
      const user = await User.findByIdAndUpdate(
        purchase.user,
        {
          avatar: purchase.icon,
        },
        { new: true }
      );
      if (!user) throw new Error("User not found");
      break;

    case "ConsumablePurchase":
      // TODO: might depend of consumable type
      break;
    default:
      throw new Error(`Invalid purchase type ${purchase.type}`);
  }
};

module.exports = {
  searchPurchases,
  getPurchase,
  redeem,
};
