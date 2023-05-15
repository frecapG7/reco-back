


const express = require('express');
const router = express.Router();


const request = require('./request');
const recommendation = require('./recommendation');


router.use('/requests', request)
router.use('/requests/:requestId/recommendations', recommendation);



module.exports = router;

