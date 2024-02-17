
const passport = require('passport');
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const User = require('../model/User');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const authService = require('../service/user/authService');
const {verifyJWT} = require('../utils/utils');


/**
 * Local strategy for authenticating users using a username and password.
 */
passport.use(new LocalStrategy({
    usernameField: "name",
    passwordField: "password"
}, async (username, password, done) => {
    try {
        const user = await authService.login(username, password);
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}
));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
}
);


/**
 * Bearer strategy for authenticating clients using an access_token
 *
 **/
passport.use(new BearerStrategy(
    async (accessToken, done) => {
        try {
            const user = await authService.validateAccessToken(verifyToken(accessToken));
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

module.exports = passport;