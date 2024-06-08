const { times } = require("lodash");
const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true,
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
  seen: {
    type: Boolean,
    default: false,
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
    type: String,
    required: false,
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
    },
    field1: this.field1,
    field2: this.field2,
    field3: this.field3,
    html: this.html,
    url: this.url,
    created_at: this.created_at,
  };
};

module.exports = mongoose.model("Recommendation", RecommendationSchema);
