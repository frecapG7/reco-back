
const Cart = require('../model/Cart');
const { NotFoundError } = require("../errors/error");


async function getCart(userId, page, pageSize) {
    const cart = await Cart.findOne({ user_id: userId });
    const resultSet = cart?.items
            .slice(page * pageSize, (page + 1) * pageSize);

    return {
        items: resultSet,
        total: cart?.items.length,
    };
}

async function addItemToCart(userId, item) {
    // 1 - Find cart based on userId or create new one
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
        cart = new Cart({
            user_id: userId,
            items: [],
        });
        // await cart.save();
    }

    // 2 - Add item to cart
    cart.items.push(new ({
        field1: item.field1,
        field2: item.field2,
        field3: item.field3,
        requestType: item.requestType,
    }));
    await cart.save();
    return cart;
}


async function deleteItemFromCart(userId, itemId) {

    // 1 - Find cart based on userId or thrown error
    const cart = await Cart.findOne({ user_id: userId });

    if (!cart)
        throw new NotFoundError(`Cannot find cart with user id ${userId}`);

    console.debug(cart);
    // 2 - Remove item from cart
    cart.items = cart.items?.filter(item => item.id !== itemId);
    await cart.save();
    return cart;

}

module.exports = {
    getCart,
    addItemToCart,
    deleteItemFromCart
}