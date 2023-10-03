
const express = require('express');
const router = express.Router();

const Request = require('../model/Request');
const RequestService = require('../service/RequestService');
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

        const results = await RequestService.search(filter, pageSize, pageNumber);

        return res.json(results);

    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Internal server error' });
    }

}
);

router.get('/:id', async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            res
                .status(404)
                .json({ message: 'Request not found' });
        } else {
            res.json(request);

        }
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error getting request' });
    }

});

router.post('', authenticateToken, async (req, res) => {

    try {
        const newRequest = new Request({
            requestType: req.body.requestType,
            description: req.body.description,
            duration: req.body.duration,
            status: 'OPEN',
            author: req.userId,
        });
        const savedRequest = await newRequest.save();
        res.json(savedRequest);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error saving request' });
    }
});

router.put('/', authenticateToken, async (req, res) => {
    try {
        const savedRequest = await Request.findOneAndUpdate(
            {
                _id: req.body._id,
                author: req.userId
            },
            {
                requestType: req.body.requestType,
                description: req.body.description,
                duration: req.body.duration,
            },
            { new: true });

        if (!savedRequest) {
            res
                .status(404)
                .json({ message: 'Request not found' });
        } else {
            res.json(savedRequest);
        }
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error updating request' });
    }
}
);

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const request = await Request.findOneAndDelete({
            _id: req.params.id,
            author: req.userId
        });
        if (!request) {
            res
                .status(404)
                .json({ message: `Cannot find request with id ${req.params.id}` });
        } else {
            res.status(200);
        }
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .json({ message: 'Internal server error' });
    }
}
);


module.exports = router;

