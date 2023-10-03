
const express = require('express');
const router = express.Router();

const RequestService = require('../service/RequestService');

router.post('/requests', async (req, res) => {

    try {

        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const filters = {
            ...(req.body.requestType && { requestType: req.body.requestType }),
            ...(req.body.duration && { duration: req.body.duration }),
            ...(req.body.author && { author: req.body.author }),
        };

        const results = await RequestService.search(filters, pageSize, pageNumber);

        res.json(results);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Internal server error' });
    }

});

module.exports = router;

