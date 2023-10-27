
const express = require('express');
const router = express.Router();
const User = require('../model/User');

const jwt = require('jsonwebtoken');
const config = require('../config');


router.post('/', async (req, res) => {
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

        const token = generateAccessToken(user);
        return res
            .status(200)
            .cookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'none' })
            .json({
                access_token: token,
                id: user._id,
                username: user.name
            });


    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error logging in' });
    }
});




const generateAccessToken = (user) => {
    const payload = user._id;
    return jwt.sign({data: payload},
        config.TOKEN_SECRET,
        { expiresIn: '1800s' });
}




module.exports = router;