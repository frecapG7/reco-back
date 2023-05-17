
const express = require('express');
const router = express.Router();

const Request = require('../model/Request');


router.get('', async (req, res) => {
    const requests = await Request.find();
    res.json(requests);
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

router.post('', async (req, res) => {

    try {
        console.log(req.body);
        const newRequest = new Request({
            requestType: req.body.requestType,
            description: req.body.description,
            duration: req.body.duration,
            status: 'OPEN',
            author: '5e8cfaa7c9e7ce2e3c9b1b0b'
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

router.put('/', async (req, res) => {
    try {
        const savedRequest = await Request.findOneAndUpdate({ _id: req.body._id },
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

router.delete('/:id', async (req, res) => {
    try {
        const request = await Request.findByIdAndDelete(req.params.id)
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

