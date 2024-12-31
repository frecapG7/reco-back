const mongoose = require("mongoose");

const PurchaseItem = require("./PurchaseItem");

const ConsumablePurchase = PurchaseItem.discriminator(
  "ConsumablePurchase",
  new mongoose.Schema(
    {
      consumableType: {
        type: String,
        required: true,
        enum: ["invitation", "boost"],
      },
    },
    {
      discriminatorKey: "type",
    }
  )
);

module.exports = ConsumablePurchase;
