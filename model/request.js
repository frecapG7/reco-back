

const mongoose = require('mongoose');



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
    return {
        id: this._id,
        requestType: this.requestType,
        description: this.description,
        duration: this.duration,
        status: this.status,
    }
};


module.exports = mongoose.model('Request', RequestSchema);