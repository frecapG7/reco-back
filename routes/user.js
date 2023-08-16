

const express = require('express');
const router = express.Router();
const User = require('../model/User');




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



router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res
                .status(404)
                .json({ message: 'User not found' });
        } else {
            res.json(user);

        }
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error getting user' });
    }
});

module.exports = router;
