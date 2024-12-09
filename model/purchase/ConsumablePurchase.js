const mongoose = require("mongoose");

const PurchaseItem = require("./PurchaseItem");

const ConsumablePurchase = PurchaseItem.discriminator(
  "ConsumablePurchase",
  new mongoose.Schema(
    {
      used: {
        type: Boolean,
        default: false,
        deprecated: true,
      },
      // Deprecated
      used_at: {
        type: Date,
        deprecated: true, // Custom option to mark as deprecated
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
    {
      discriminatorKey: "type",
    }
  )
);

module.exports = ConsumablePurchase;
