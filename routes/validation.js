const express = require('express');
const router = express.Router();


const tokenValidation = require('../service/validation/tokenValidation');
const userValidation = require('../service/validation/userValidation');



/**
 * POST /validate/token 
 */
router.post('/token', async (req, res, next) => {
    try{
        await tokenValidation.validateToken(req.body?.value);
        return res.status(200).send();
    }catch(err){
        next(err);
    }
});

/**
 * POST /validate/email
 */
router.post('/email', async (req, res, next) => {
    try {
        await userValidation.validateEmailUnicity(req.body.value);
        return res.status(200).send();
    }catch(err){
        next(err);
    }
});


/**
 * POST /validate/username
 */
router.post('/username', async (req, res, next) => {
    try{
        await userValidation.validateUsernameUnicity(req.body?.value);
        return res.status(200).send();
    }catch(err){
        next(err);
    }
});

module.exports = router;