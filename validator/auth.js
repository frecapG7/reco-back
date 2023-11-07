
const jwt = require('jsonwebtoken');
const config = require('../config');
const mongoose = require('mongoose');



//TODO: move to middleware
const authenticateToken = (req, res, next) => {


    const headers = req.headers['authorization'];
    // const headers = req.headers['Cookie'];
    const token = headers && headers.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, config.TOKEN_SECRET, (err, decodedToken) => {
        console.debug(decodedToken);

        if (err){
            console.error(err);
            return res.sendStatus(403);
        } 
        // req.userId = new mongoose.Types.ObjectId(decodedToken.id);
        req.userId = decodedToken.data;
        next();
    });
}


module.exports = {
    authenticateToken
}
