


const express = require('express');
const router = express.Router();


const request = require('./request');
const recommendation = require('./recommendation');
const authentication = require('./authentication');
const user = require('./user');
const cart = require('./cart');

router.use('/requests', request)
router.use('/requests/:requestId/recommendations', recommendation);



router.use('/auth', authentication);

router.use('/users', user);
router.use('/users/:userId/cart', cart);


module.exports = router;

