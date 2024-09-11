const mongoose = require("mongoose");

const UserPurchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    item: {
      type: mongoose.Schema.ObjectId,
      ref: "MarketItem",
      required: true,
      immutable: true,
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
    },
  },
  {
    collection: "user_purchases",
  }
);


