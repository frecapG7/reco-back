


const express = require('express');
const router = express.Router();


const request = require('./request');
const recommendation = require('./recommendation');
const user = require('./user');
const cart = require('./cart');
const validation = require('./validation');
const admin = require('./admin');
const oauth = require('./oauth2');



const passport = require('../auth');


// ********** Routes **********

// ********** Request **********
router.use('/requests', passport.authenticate('bearer', { session: false }), request)
router.use('/requests/:requestId/recommendations',  passport.authenticate('bearer', { session: false }), recommendation);

// ********** User **********
router.use('/users', user);
router.use('/users/:userId/cart', passport.authenticate('bearer', { session: false }), cart);

router.use('/validate', validation);

// ********** Admin **********
router.use('/admin', passport.authenticate('bearer', { session: false }), admin);


// ********** Authentication **********
router.use("/auth", oauth);


module.exports = router;

