const e = require("cors");
const { times } = require("lodash");
const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  field1: {
    type: String,
    required: true,
  },
  field2: {
    type: String,
    required: false,
  },
  field3: {
    type: String,
    required: false,
  },
  html: {
    type: String,
    required: false,
  },
  url: {
    type: String,
    required: false,
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
  duplicate_from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recommendation",
    required: false,
  },
  provider: {
    name: {
      type: String,
    },
    icon: {
      type: String,
    },
  },
  // Use for search
  requestType: {
    type: String,
    required: true,
    enum: ["BOOK", "SONG", "MOVIE"],
  },
});

RecommendationSchema.methods.toJSON = function () {
  return {
    id: this._id,
    request: this.request._id,
    user: {
      id: this.user._id,
      name: this.user.name,
      title: this.user.title,
      avatar: this.user.avatar,
    },
    field1: this.field1,
    field2: this.field2,
    field3: this.field3,
    html: this.html,
    url: this.url,
    type: this.requestType,
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
