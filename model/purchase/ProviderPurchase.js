const mongoose = require("mongoose");
const PurchaseItem = require("./PurchaseItem");

const ProviderPuchase = PurchaseItem.discriminator(
  "ProviderPurchase",
  new mongoose.Schema({}),
  {
    discriminatorKey: "type",
  }
);

module.exports = ProviderPuchase;
