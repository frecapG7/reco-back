const mongoose = require("mongoose");

const options = {
  discriminatorKey: "type",
};

const MarketItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    disable: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  options
);
const MarketItem = mongoose.model("MarketItem", MarketItemSchema);

const MarketIcon = MarketItem.discriminator(
  "IconItem",
  new mongoose.Schema({
    svgContent: String,
  }),
  options
);
const MarketTitle = MarketItem.discriminator(
  "TitleItem",
  new mongoose.Schema({
    titleValue: String,
  }),
  options
);

module.exports = {
  MarketItem,
  MarketIcon,
  MarketTitle,
};
