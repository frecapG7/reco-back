
const jwt = require('jsonwebtoken');
const config = require('../config');



const authenticateToken = (req, res, next) => {


    const headers = req.headers['authorization'];
    const token = headers && headers.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, config.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


module.exports = {
    authenticateToken
}
