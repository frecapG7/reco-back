
const { Cart, CartItem } = require('../../model/Cart');
const { NotFoundError } = require("../../errors/error");




const getCart = async (userId, page, pageSize) => {
    // 1 - Find cart
    const cart = await Cart.findOne({ user: userId });

    // 2 - If no cart return empty array
    if (!cart)
        return {
            items: []
        };
    return cart;
}

const addItemToCart = async (userId, item) => {
    // 1 - Find cart based on userId or create new one
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({
            user: userId,
        });
    }

    // 2 - Add item to cart
    cart.items?.push(new CartItem({
        field1: item.field1,
        field2: item.field2,
        field3: item.field3,
        type: item.requestType,
    }));
    const savedCart =  await cart.save();
    return savedCart;
}


const deleteItemFromCart = async (userId, itemId) => {

    // 1 - Find cart based on userId or thrown error
    const cart = await Cart.findOne({ user: userId });

    if (!cart)
        throw new NotFoundError(`Cannot find cart with user id ${userId}`);

    // 2 - Find index of item to remove
    const index = cart.items?.findIndex(item => item._id === itemId);
    if (index !== -1) {
        // 3 - a Remove item based on index
        cart.items.splice(index, 1);
        // 3 -b Return saved cart
        return await cart.save();
    }

    // 4 - Return same cart
    return cart;
}

const markItemAsRead = async (userId, itemId) => {
    // 1 - Find cart based on userId or thrown error
    const cart = await Cart.findOne({ user: userId });
    if (!cart)
        throw new NotFoundError(`Cannot find cart with user id ${userId}`);
    // 2 - Find index of item to edit
    const index = cart.items?.findIndex(item => item._id === itemId);
    if (index !== -1) {
        // 3 - a Edit item based on index
        cart.items[index].status = 'READ';
        // 3 -b Return saved cart
        return await cart.save();
    }

    // 4 - Return same cart
    return cart;

}


module.exports = {
    getCart,
    addItemToCart,
    deleteItemFromCart,
    markItemAsRead
}