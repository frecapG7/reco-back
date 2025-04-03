const e = require("cors");
const { times } = require("lodash");
const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    name: {
      type: String,
    },
    icon: {
      type: String,
    },
  },
  requestType: {
    type: String,
    required: true,
    enum: ["BOOK", "SONG", "MOVIE"],
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  html: {
    type: String,
    required: false,
  },
  url: {
    type: String,
    required: false,
  },
  note: {
    type: String,
    required: false,
    maxlength: 255,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likesCount: {
    type: Number,
    default: 0,
    index: true,
  },
  field1: {
    type: String,
    deprecated: true,
  },
  field2: {
    type: String,
    deprecated: true,
  },
  field3: {
    type: String,
    deprecated: true,
  },

  duplicate_from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recommendation",
    deprecated: true,
  },
});

RecommendationSchema.methods.toJSON = function () {
  return {
    id: this._id,
    request: this.request?._id,
    user: {
      id: this.user._id,
      name: this.user.name,
      title: this.user.title,
      avatar: this.user.avatar,
    },
    title: this.title || this.field1,
    author: this.author || this.field2,
    url: this.url,
    html: this.html,
    note: this.note,
    requestType: this.requestType,
    created_at: this.created_at,
    provider: {
      name: this.provider?.name,
      icon: this.provider?.icon,
    },
    likesCount: this.likes.length,
  };
};

RecommendationSchema.methods.isLikedBy = function (userId) {
  if (!userId) return false;
  return this.likes.some((like) => like.equals(userId));
};

module.exports = mongoose.model("Recommendation", RecommendationSchema);
