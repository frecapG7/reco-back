const express = require('express');
const router = express.Router({ mergeParams: true });

const cartService = require('../service/user/cartService');
const { ForbiddenError } = require('../errors/error');





/**
 * Get all items in cart of a user based on request param user id
 */
router.get('', async (req, res, next) => {
    try {
        const result = await cartService.getCart(req.params.userId, 1, 10);
        return res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * Add an item to cart of a user based on request param user id
 */
router.post('', async (req, res, next) => {
    try {
        if (req.params.userId !== req.user._id)
            throw new ForbiddenError('You cannot add item to other user cart');

        const cart = await cartService.addItemToCart(req.params.userId, req.body);
        res.status(201)
            .json(cart);

    } catch (err) {
        next(err);
    }
});

/**
 * Delete an item in cart
 */
router.delete('/:itemId',async (req, res, next) => {
    try {
        if (req.params.userId !== req.user._id)
            next(new ForbiddenError('You cannot delete item from other user cart'));

        await cartService.deleteItemFromCart(req.params.userId, req.params.itemId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});



/**
 * Mark an item as read
 */
router.put('/:itemId/mark-read',async (req, res, next) => {
    try {
        if (req.params.userId !== req.user._id)
            throw new ForbiddenError('You cannot delete item from other user cart');

        const cart = await cartService.markItemAsRead(req.params.userId, req.params.itemId);
        res.json(cart);
    } catch (err) {
        next(err);
    }

});

module.exports = router;




