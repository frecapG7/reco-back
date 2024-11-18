const mongoose = require("mongoose");

const PurchaseItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },
    item: {
      type: mongoose.Schema.ObjectId,
      ref: "MarketItem",
      required: true,
      immutable: true,
    },
    payment_details: {
      price: {
        type: Number,
        required: true,
        immutable: true,
      },
      purchased_at: {
        type: Date,
        required: true,
        default: Date.now,
        immutable: true,
        index: true,
      },
      details: {
        type: String,
        required: false,
        immutable: true,
      },
    },
  },
  {
    discriminatorKey: "type",
    timestamps: true,
  }
);

const PurchaseItem = mongoose.model("PurchaseItem", PurchaseItemSchema);

module.exports = PurchaseItem;
