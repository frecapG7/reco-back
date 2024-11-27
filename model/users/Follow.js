const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  hide: {
    type: Boolean,
    default: false,
  },
});

module.exports = FollowSchema;
