
const jwt = require('jsonwebtoken');
const config = require('../config');
const mongoose = require('mongoose');
const authService = require('../service/authService');



//TODO: move to middleware
const authenticateToken = (req, res, next) => {


    const authorizationHeader = req.headers && req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    const decodedToken = authService.verifyToken(token);
    if(!decodedToken) return res.sendStatus(403);

    req.userId = decodedToken;
    next();
}




module.exports = {
    authenticateToken
}
