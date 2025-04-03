const mongoose = require("mongoose");

const oAuthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },
  expiration: {
    type: Date,
    required: true,
  },
});

const OAuthToken = mongoose.model("OAuthToken", oAuthSchema);

module.exports = OAuthToken;
