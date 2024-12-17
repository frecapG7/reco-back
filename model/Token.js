const mongoose = require("mongoose");
const { generateRandom } = require("../utils/utils");

const tokenSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["ACCOUNT_CREATION", "PASSWORD_RESET"],
  },
  used: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiration: {
    type: Date,
    default: () => {
      const now = new Date(Date.now());
      // Expire in 2 days
      return now.setDate(now.getDate() + 2);
    },
  },
});

module.exports = mongoose.model("Token", tokenSchema);
