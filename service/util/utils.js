
const crypto = require('crypto');

const generateRandom = (size) => {
    return crypto.randomBytes(size).toString('hex');
}

module.exports = {
    generateRandom
}