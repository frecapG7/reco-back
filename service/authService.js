
const jwt = require('jsonwebtoken');
const config = require('../config');
const { ForbiddenError } = require('../errors/error');



const generateToken = (user) => {
    const payload = user._id;
    return jwt.sign({data: payload},
        config.TOKEN_SECRET,
        { expiresIn: '1800s' });
}


const verifyToken = (token) => {
    try{
        const decodedToken = jwt.verify(token, config.TOKEN_SECRET);
        return decodedToken.data;
    }catch(err) {
        throw new ForbiddenError('Invalid token');
    }
}

module.exports = {
    generateToken,
    verifyToken
}