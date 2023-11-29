
const express = require('express');
const router = express.Router();
const User = require('../model/User');
const authService = require('../service/authService');

const jwt = require('jsonwebtoken');


router.post('/', async (req, res, next) => {
    try {
        const user = await User.findOne({
            $or: [
                { email: req.body.name },
                { name: req.body.name }
            ]
        });

        // Verify user is found
        if (!user)
            return res
                .status(401)
                .json({ message: 'Authentication failed.' });

        // Verify password is correct
        if (!user.validPassword(req.body.password))
            return res
                .status(401)
                .json({ message: 'Authentication failed.' });

        const token = authService.generateToken(user);
        return res
            .status(200)
            .cookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'none' })
            .json({
                access_token: token,
                id: user._id,
                username: user.name
            });

    } catch (err) {
        req.log.error(err);
        next(err);
    }
});







module.exports = router;