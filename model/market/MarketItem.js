const mongoose = require("mongoose");

const options = {
  discriminatorKey: "type",
};

const MarketItemSchema = new mongoose.Schema(
  {
    /**
     * @property {String} name - The name of the item
     * @required
     * @unique
     */
    name: {
      type: String,
      required: true,
      unique: true,
    },
    /**
     * @property {String} label - The label of the item as shown in the UI
     * @required
     */
    label: {
      type: String,
      required: true,
    },
    /**
     * @property {String} description - The description of the item shown in the store
     */
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      required: false,
    },
    created_by: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
    },
    modified_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    modified_by: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  options
);

MarketItemSchema.pre("findOneAndUpdate", function (next) {
  this._update.modified_at = new Date();
  next();
});
MarketItemSchema.pre("save", function (next) {
  this.modified_at = new Date();
  next();
});

MarketItemSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    label: this.label,
    description: this.description,
    price: this.price,
    tags: this.tags,
    type: this.type,
    ...(this.type === "IconItem" && {
      url: this.url,
      icon: this.url,
    }),
    ...(this.type === "TitleItem" && {
      titleValue: this.titleValue,
    }),
    ...(this.type === "ConsumableItem" && {
      icon: this.icon,
      consumableType: this.consumableType,
    }),
  };
};

const MarketItem = mongoose.model("MarketItem", MarketItemSchema);

const MarketIcon = MarketItem.discriminator(
  "IconItem",
  new mongoose.Schema({
    url: {
      type: String,
      required: true,
    },
    // If the icon is available on signup
    freeOnSignup: {
      type: Boolean,
      default: false,
    },
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

const MarketConsumable = MarketItem.discriminator(
  "ConsumableItem",
  new mongoose.Schema({
    icon: {
      type: String,
      required: true,
    },
    consumableType: {
      type: String,
      required: true,
      enum: ["invitation", "boost"],
    },
  }),
  options
);

module.exports = {
  MarketItem,
  MarketIcon,
  MarketTitle,
  MarketConsumable,
};
