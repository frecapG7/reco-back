const mongoose = require("mongoose");
const crypto = require("crypto");

const constants = require("../constants");
const Follow = require("./users/Follow");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  hash: String,
  salt: String,
  role: {
    type: String,
    default: "USER",
    required: true,
    enum: ["USER", "ADMIN"],
  },
  avatar: {
    type: String,
  },
  defaultAvatar: {
    type: String,
  },
  settings: {
    lang: {
      type: String,
      default: constants.defaultSettings.lang,
    },
    theme: {
      type: String,
      default: constants.defaultSettings.theme,
    },
    notifications: {
      type: Boolean,
      default: constants.defaultSettings.notifications,
    },
    privacy: {
      privateRequests: {
        type: Boolean,
        default: constants.defaultSettings.privacy.privateRequests,
      },
      privateRecommendations: {
        type: Boolean,
        default: constants.defaultSettings.privacy.privateRecommendations,
      },
      privateFollows: {
        type: Boolean,
        default: constants.defaultSettings.privacy.privateFollows,
      },
      privatePurchases: {
        type: Boolean,
        default: constants.defaultSettings.privacy.privatePurchases,
      },
    },
  },
 
  balance: {
    type: Number,
    default: 20,
  },
  title: {
    type: String,
    default: "Rookie Balboa",
  },
  created: {
    type: Date,
    default: Date.now,
  },
  follows: [Follow],
});

// Method to set salt and hash password for user
UserSchema.methods.setPassword = function (password) {
  // Creating a unique salt
  this.salt = crypto.randomBytes(16).toString("hex");

  // hashing password and salt
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 100, 64, "sha512")
    .toString("hex");
};

// Method to validate password
UserSchema.methods.validPassword = function (password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 100, 64, "sha512")
    .toString("hex");
  return this.hash === hash;
};

// Method to build JSON response
UserSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    title: this.title,
    avatar: this.avatar ? this.avatar : this.defaultAvatar,
    balance: this.balance,
    created: this.created,
    privacy: {
      privateRequests: this.settings.privacy.privateRequests,
      privateRecommendations: this.settings.privacy.privateRecommendations,
      privateFollows: this.settings.privacy.privateFollows,
    },
  };
};

module.exports = mongoose.model("User", UserSchema);
