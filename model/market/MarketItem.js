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
    i18nDescription: {
      en: {
        type: String,
        required: false,
      },
      fr: {
        type: String,
        required: false,
      },
    },
    /**
     * @property {String} icon - An link to the icon of the item
     * @required
     */
    icon: {
      type: String,
      required: true,
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
    description: {
      en: this.i18nDescription.en || this.description,
      fr: this.i18nDescription.fr,
    },
    price: this.price,
    tags: this.tags,
    type: this.type,
    icon: this.icon,
    ...(this.type === "TitleItem" && {
      titleValue: this.titleValue,
    }),
    ...(this.type === "ConsumableItem" && {
      consumableType: this.consumableType,
    }),
    ...(this.type === "ProviderItem" && {
      requestType: this.requestType,
    }),

    created: this.created_at,
    created_by: {
      id: this.created_by,
      ...(this.populated("created_by") && {
        name: this.created_by.name,
        title: this.created_by.title,
        avatar: this.created_by.avatar,
      }),
    },
    modified: this.modified_at,
  };
};

const MarketItem = mongoose.model("MarketItem", MarketItemSchema);

const MarketIcon = MarketItem.discriminator(
  "IconItem",
  new mongoose.Schema(),
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
    consumableType: {
      type: String,
      required: true,
      enum: ["invitation", "boost"],
    },
  }),
  options
);

const MarketProvider = MarketItem.discriminator(
  "ProviderItem",
  new mongoose.Schema({
    requestType: {
      type: String,
      required: true,
      enum: ["BOOK", "SONG", "MOVIE"],
    },
  }),
  options
);

module.exports = {
  MarketItem,
  MarketIcon,
  MarketTitle,
  MarketConsumable,
  MarketProvider,
};
