
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
                .json({ message: 'Authentication failed. User not found.' });

        // Verify password is correct
        if (!user.validPassword(req.body.password))
            return res
                .status(401)
                .json({ message: 'Authentication failed. Wrong password.' });

        const token = generateAccessToken(user);
        console.debug(token);
        //TODO: protect field from user model from json
        return res
            .status(200)
            .json({access_token: token});
        //.json(user);


    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error logging in' });
    }
});




const generateAccessToken = (user) => {
    console.log(config.TOKEN_SECRET);
    return jwt.sign(user.toJSON(), config.TOKEN_SECRET, { expiresIn: '1800s' });
}




module.exports = router;