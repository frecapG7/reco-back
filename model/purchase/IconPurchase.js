const PurchaseItem = require("./PurchaseItem");
const mongoose = require("mongoose");

const IconPurchase = PurchaseItem.discriminator(
  "IconPurchase",
  new mongoose.Schema({
    icon: {
      type: String,
      required: true,
    },
  }),
  {
    discriminatorKey: "type",
  }
);

module.exports = IconPurchase;
