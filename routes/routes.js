


const express = require('express');
const router = express.Router();


const request = require('./request');
const recommendation = require('./recommendation');
const authentication = require('./authentication');
const user = require('./user');
const cart = require('./cart');
const validation = require('./validation');
const oauth = require('./oauth2');


const passport = require('../auth');


router.use('/requests', request)
router.use('/requests/:requestId/recommendations', recommendation);



//router.use('/auth', authentication);

router.use('/users', user);
router.use('/users/:userId/cart', cart);

router.use('/validate', validation),

// router.post('/login', passport.authenticate('local'), async (req, res) => {
//     res.json({ message: 'Logged in', user: req.user });
// });

router.use("/auth", oauth);


module.exports = router;

