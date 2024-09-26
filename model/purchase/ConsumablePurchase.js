const mongoose = require("mongoose");

const PurchaseItem = require("./PurchaseItem");

const ConsumablePurchase = PurchaseItem.discriminator(
  "ConsumablePurchase",
  new mongoose.Schema(
    {
      used: {
        type: Boolean,
        default: false,
      },
      used_at: {
        type: Date,
      },
    },
    {
      discriminatorKey: "type",
    }
  )
);

module.exports = ConsumablePurchase;
