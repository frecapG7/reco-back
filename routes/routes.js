


const express = require('express');
const router = express.Router();


const request = require('./request');


router.use('/requests', request);


module.exports = router;

