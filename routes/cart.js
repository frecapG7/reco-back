const express = require('express');
const router = express.Router({ mergeParams: true });

const { authenticateToken } = require('../validator/auth');
const cartService = require('../service/cartService');





/**
 * Get all items in cart of a user based on request param user id
 */
router.get('', async (req, res, next) => {
    try {
        const cart = cartService.getCart(req.params.userId, 1, 10);
        res.json(cart);
    } catch (err) {
        next(err);
    }
});

/**
 * Add an item to cart of a user based on request param user id
 */
router.post('', authenticateToken, async (req, res, next) => {
    try {
        if (req.params.userId !== req.userId)
            next(new ForbiddenError('You cannot add item to other user cart'));

        const cart = await cartService.addItemToCart(req.userId, req.body);
        res.status(201)
            .json(cart);

    } catch (err) {
        next(err);
    }
});

/**
 * Delete an item in cart
 */
router.delete('/:itemId', authenticateToken, async (req, res, next) => {
    try {
        if (req.params.userId !== req.userId)
            next(new ForbiddenError('You cannot delete item from other user cart'));

        const cart = await cartService.deleteItemFromCart(req.userId, req.params.itemId);
        res.json(cart);
    } catch (err) {
        next(err);
    }
});



module.exports = router;




