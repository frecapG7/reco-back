

const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    created_at: {
        type: Date,
        default: Date.now,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
});

RecommendationSchema.methods.toJSON = function () {
    return {
        id: this._id,
        request_id: this.request_id,
        user_id: this.user_id,
        field1: this.field1,
        field2: this.field2,
        field3: this.field3,
        created_at: this.created_at,
    }
};


module.exports = mongoose.model('Recommendation', RecommendationSchema);