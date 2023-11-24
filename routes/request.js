
const express = require('express');
const router = express.Router();

const Request = require('../model/Request');
const requestService = require('../service/requestService');
const { authenticateToken } = require('../validator/auth');

/**
 * GET /requests created by logged user
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {

        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const status = req.query.status || 'OPEN';

        const filter = {
            author: req.userId,
            status: status,
        }

        const results = await requestService.search(filter, pageSize, pageNumber);

        return res.json(results);

    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Internal server error' });
    }

}
);

router.get('/:id', async (req, res, next) => {
    try {
        const request = await requestService.getRequest(req.params.id);
        res.status(200).json(request);
    } catch (err) {
        next(err);
    }

});

router.post('', authenticateToken, async (req, res, next) => {

    try {
        const request = await requestService.createRequest(req.body, req.userId);
        res.status(201)
            .json(request);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
    try {
        const savedRequest = requestService.updateRequest(req.params.id, req.body, req.userId);
        res
            .status(204)
            .json(savedRequest);
    } catch (err) {
        next(err);
    }
}
);

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const request = requestService.deleteRequest(req.params.id, req.userId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
);


module.exports = router;

