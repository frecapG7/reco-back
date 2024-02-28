
'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

const generateRandom = (size) => {
    return crypto.randomBytes(size).toString('hex');
}


const generateJWT = (value) => {
    return jwt.sign(value, config.TOKEN_SECRET, {
        algorithm: 'HS256',
    });
}
const verifyJWT = (token) => {
    return jwt.verify(token, config.TOKEN_SECRET);
}


module.exports = {
    generateRandom,
    generateJWT,
    verifyJWT
}