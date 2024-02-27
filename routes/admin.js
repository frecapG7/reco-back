
const express = require('express');
const router = express.Router({ mergeParams: true });




router.post('/token', async (req, res, next) => {
    try {

        if(req.user.role !== 'admin')
            throw new ForbiddenError('You cannot generate token');

        const token = await TokenService.generateToken(req.user);





        res.status(201)
            .json(token);
    } catch (err) {
        next(err);
    }

});
