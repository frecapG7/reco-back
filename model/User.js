
const mongoose = require('mongoose');
const crypto = require('crypto');

const constants = require('../constants');


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    hash: String,
    salt: String,
    role: {
        type: String,
        default: "USER"
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
    },
    balance: {
        type: Number,
        default: 20
    },
    created: {
        type: Date,
        default: Date.now,
    }
});

// Method to set salt and hash password for user
UserSchema.methods.setPassword = function (password) {
    // Creating a unique salt
    this.salt = crypto.randomBytes(16).toString('hex');

    // hashing password and salt 
    this.hash = crypto.pbkdf2Sync(password, this.salt, 100, 64, 'sha512').toString('hex');
}

// Method to validate password
UserSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 100, 64, 'sha512').toString('hex');
    return this.hash === hash;

}

// Method to build JSON response
UserSchema.methods.toJSON = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        created: this.created,
    }
}




module.exports = mongoose.model('User', UserSchema);
