

const express = require('express');
const router = express.Router();
const User = require('../model/User');
// const { authenticateToken } = require('../validator/auth');
const auth = require('../validator/auth');
const userService = require('../service/userService');
const { ForbiddenError } = require('../errors/error');




/**
 * POST /user to create new user
 */
router.post('', async (req, res) => {
    try {
        const existingUser = await User.findOne({
            $or: [
                { email: req.body.email },
                { name: req.body.name }
            ]
        });

        if (existingUser)
            return res
                .status(409)
                .json({ message: 'User already exists' });

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
        });
        newUser.setPassword(req.body.password);
        const savedUser = await newUser.save();
        return res
            .status(200)
            .json(savedUser.toJSON());


    } catch (err) {
        console.log(err);
        res
            .status(500)
            .json({ message: 'Error creating user' });
    }
});


/**
 * GET /user to get user by id
 */
router.get('/:id', auth.authenticateToken, async (req, res, next) => {
    try {
        const user = await userService.getUser(req.params.id);
        return res.json(user);
    } catch (err) {
        console.error(err);
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
        console.error(err);
        next(err);
    }


});



module.exports = router;
