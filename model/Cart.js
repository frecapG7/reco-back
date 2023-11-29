const mongoose = require('mongoose');


const CartItemSchema = new mongoose.Schema({
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
    type: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'OPEN'
    }
});
    

const CartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [CartItemSchema]
});


module.exports = {
    Cart: mongoose.model('Cart', CartSchema),
    CartItem: mongoose.model('CartItem', CartItemSchema)
};