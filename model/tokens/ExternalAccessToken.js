const mongoose = require("mongoose");

const externalAccessToken = new mongoose.Schema({
  provider: {
    type: String,
    enum: ["soundcloud", "spotify"],
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
  expiresAt: {
    type: Date,
    required: true,
  },
});

const ExternalAccessToken = mongoose.model(
  "ExternalAccessToken",
  externalAccessToken
);

module.exports = ExternalAccessToken;
