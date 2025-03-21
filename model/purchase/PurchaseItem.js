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
    quantity: {
      type: Number,
      required: true,
      default: 0,
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
    toJSON: { virtuals: true },
  }
);

PurchaseItemSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    ...(this.populated("item") && {
      item: {
        id: this.item._id,
        name: this.item.name,
        label: this.item.label,
        description: this.item.description,
      },
    }),
    type: this.type, // This is the discriminator key
    ...(this.type === "IconPurchase" && {
      icon: this.icon,
    }),
    ...(this.type === "ConsumablePurchase" && {
      icon: this.item?.icon,
    }),
    quantity: this.quantity,
    payment_details: this.payment_details,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const PurchaseItem = mongoose.model("PurchaseItem", PurchaseItemSchema);

module.exports = PurchaseItem;
