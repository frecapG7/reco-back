const mongoose = require('mongoose');
const {generateRandom} = require('../service/util/utils');


const tokenSchema = new mongoose.Schema({
    value: {
        type: String,
        default: generateRandom(4)
    },
    type: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    expiration: {
        type: Date,
        default : () => {
            const now = new Date(Date.now());
            // Expire in 2 days
            return now.setDate(now.getDate() + 2);
        } 
    }
});

module.exports = mongoose.model('Token', tokenSchema);

