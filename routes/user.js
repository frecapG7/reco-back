

const express = require('express');
const router = express.Router();
const User = require('../model/User');
const auth = require('../validator/auth');
const userService = require('../service/userService');
const { ForbiddenError } = require('../errors/error');




/**
 * POST /user to create new user
 */
router.post('', async (req, res, next) => {
    try {
        const savedUser = await userService.createUser(req.body);
        return res
            .status(201)
            .json(savedUser);
    } catch (err) {
        next(err);    
    }
});


/**
 * GET /user to get user by id
 */
router.get('/:id', auth.authenticateToken, async (req, res, next) => {
    try {
        req.log?.info('call API');
        const user = await userService.getUser(req.params.id);
        return res.json(user);
    } catch (err) {
        next(err);
    }
});


/**
 * PUT /user to update user
 */
router.put('/:id', auth.authenticateToken, async (req, res, next) => {
    try {

        if (req.userId !== req.params.id)
            throw new ForbiddenError('You cannot update other user');
        const user = await userService.updateUser(req.params.id, req.body);
        return res.json(user);
    } catch (err) {
        next(err);
    }


});



module.exports = router;
