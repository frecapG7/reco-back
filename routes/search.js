
const express = require('express');
const router = express.Router();

const Request = require('../model/Request');




router.post('/requests', async (req, res) => {

    try {

        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const filter = {
            ...(req.body.requestType && { requestType: req.body.requestType }),
            ...(req.body.duration && { duration: req.body.duration }),
            ...(req.body.author && { author: req.body.author }),
        };

        
        const result = await Request.aggregate([
            { $match: filter },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]

                }
            }
        ]);

        const totalCount = result[0].totalCount[0]?.count || 0; // Retrieve the total count from the result
        const totalPages = Math.ceil(totalCount / pageSize); // Calculate the total number of pages
        const paginatedResults = result[0].paginatedResults; // Retrieve the paginated results

        res.json({
            totalPages: totalPages,
            totalCount: totalCount,
            results: paginatedResults
        });
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Internal server error' });
    }

});

module.exports = router;

