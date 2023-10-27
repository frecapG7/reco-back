const mongoose = require('mongoose');


const CartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            default: mongoose.Types.ObjectId,
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
        requestType: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: 'OPEN'
        }
    }]
});


module.exports = mongoose.model('Cart', CartSchema);