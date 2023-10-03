

const mongoose = require('mongoose');
const { create } = require('./User');
const { remainingDays, isPast } = require('../utils/dateUtils');



const RequestSchema = new mongoose.Schema({
    requestType: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});

RequestSchema.methods.toJSON = function () {
    const expired = isPast(this.created_at, Date.now(), this.duration);
    return {
        id: this._id,
        requestType: this.requestType,
        description: this.description,
        duration: this.duration,
        status: expired ? "CLOSED" : "OPEN",
        remainingDays: expired ? 0 : remainingDays(this.created_at, Date.now(), this.duration),
        created: this.created_at,
        author: this.author._id
    }
};


module.exports = mongoose.model('Request', RequestSchema);