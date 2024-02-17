const { ForbiddenError, UnAuthorizedError } = require("../../errors/error");
const User = require("../../model/User");
const { generateRandom } = require("../../utils/utils");

const OAuthToken = require("../../model/OAuthToken");




const login = async (username, password) => {

    const user = await User.findOne({
        $or: [
            { email: username },
            { name: username }
        ]
    });

    // Verify user is found
    if (!user)
        throw new ForbiddenError('Authentication failed.');


    // Verify password is correct
    if (!user.validPassword(password))
        throw new ForbiddenError('Authentication failed.');

    return user;
}

const logout = async (user) => {
    const oAuthToken = await OAuthToken.findOne({ user: user._id });
    if (oAuthToken)
        await oAuthToken.remove();
    return;
}

/**
 * Verify access_token validity and return user
 * @param {*} accessToken 
 * @returns 
 */
const validateAccessToken = async (accessToken) => {
    const oAuthToken = await OAuthToken.findOne({ accessToken })
        .populate('user')
        .exec();

    if (!oAuthToken)
        throw new UnAuthorizedError('Invalid access token.');

    if (oAuthToken.expiration < new Date())
        throw new UnAuthorizedError('Access token expired.');


    if (!oAuthToken.user)
        throw new UnAuthorizedError('Invalid access token.');

    return oAuthToken.user;
}

/**
 * 
 * @param {User} user 
 * @returns 
 */
const generateAccessToken = async (user) => {
    // 1 - Find existing token linked to user
    const existingToken = await OAuthToken.findOne({ user: user._id });

    // 2 - If token exists, update expiration and return
    if (existingToken) {
        existingToken.expiration = new Date(new Date().getTime() + 3600 * 1000);
        const savedToken = await existingToken.save();
        return savedToken;
    } else {
        // 3 - If token does not exist, create new token and return
        const newToken = new OAuthToken({
            user: user._id,
            accessToken: generateRandom(256),
            refreshToken: generateRandom(256),
            expiration: new Date(new Date().getTime() + 3600 * 1000)
        });
        const savedToken = await newToken.save();
        return savedToken;
    }

}


const refreshToken = async (refreshToken) => {
    // 1 - Find token based on refresh token
    const oAuthToken = await OAuthToken.findOne({ refreshToken });
    // 2 - Verify token exists
    if (!oAuthToken)
        throw new UnAuthorizedError('Invalid refresh token.');

    // 3 - Verify token is not expired
    if (oAuthToken.expiration < new Date())
        throw new UnAuthorizedError('Invalid refresh token.');

    // 4 - Generate new access token
    const newAccessToken = generateRandom(256);
    oAuthToken.accessToken = newAccessToken;
    oAuthToken.expiration = new Date(new Date().getTime() + 3600 * 1000);
    const savedToken = await oAuthToken.save();
    return savedToken;
}



module.exports = {
    login,
    logout,
    validateAccessToken,
    generateAccessToken,
    refreshToken
}