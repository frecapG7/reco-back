


const express = require('express');
const router = express.Router();


const request = require('./request');
const recommendation = require('./recommendation');
const search = require('./search');
const authentication = require('./authentication');
const user = require('./user');


router.use('/requests', request)
router.use('/requests/:requestId/recommendations', recommendation);


router.use('/search', search);

router.use('/auth', authentication);

router.use('/users', user);


module.exports = router;

