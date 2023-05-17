


const express = require('express');
const router = express.Router();


const request = require('./request');
const recommendation = require('./recommendation');
const search = require('./search');


router.use('/requests', request)
router.use('/requests/:requestId/recommendations', recommendation);


router.use('/search', search);


module.exports = router;

