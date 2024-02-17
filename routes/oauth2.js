'use strict';

const oauth2orize = require('oauth2orize');
const passport = require('passport');
const express = require('express');
const router = express.Router();

const authService = require('../service/user/authService');

const { generateRandom, generateJWT, verifyJWT } = require('../utils/utils');



/** 
// Create OAuth 2.0 server
const server = oauth2orize.createServer();



server.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {

    passport.authenticate('local', { session: false }, async (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);

        const accessToken = generateRandom(256);
        const refreshToken = generateRandom(256);

        // Save token TODO

        return done(null, accessToken, refreshToken, { expires_in: 3600 });
    });
}));
**/

router.post('', passport.authenticate('local', { session: false }), async (req, res, next) => {

    try {
        // 1 - Generate access token
        const token = await authService.generateAccessToken(req.user);

        // 2 - Save token
        res.json({
            access_token: generateJWT(token.accessToken),
            refresh_token: generateJWT(token.refreshToken),
            user_id: req.user.id,
            user_name: req.user.name
        });
    } catch (err) {
        next(err);
    }

});


router.post('/refresh', async (req, res, next) => {
    try{
       const token = await authService.refreshToken(verifyJWT(req.body.refresh_token));
       res.json({
           access_token: generateJWT(token.accessToken),
           refresh_token: generateJWT(token.refreshToken),
       });

    }catch(err){
        next(err);
    }
});

module.exports = router;
