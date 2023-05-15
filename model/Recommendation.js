

const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    request_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
    },
    user_id: {
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
    }
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);