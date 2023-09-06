
const jwt = require('jsonwebtoken');
const config = require('../config');
const mongoose = require('mongoose');



const authenticateToken = (req, res, next) => {


    const headers = req.headers['authorization'];
    const token = headers && headers.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, config.TOKEN_SECRET, (err, decodedToken) => {
        if (err) return res.sendStatus(403);
        req.userId = new mongoose.Types.ObjectId(decodedToken.id);
        next();
    });
}


module.exports = {
    authenticateToken
}
