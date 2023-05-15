const express = require('express');
const router = express.Router({ mergeParams: true });


const Request = require('../model/Request');
const Recommendation = require('../model/Recommendation');

router.get('', async (req, res) => {
    try {
        console.log(req.params.requestId);
        const request = await Request.findById(req.params.requestId);
        if (!request) {
            res
                .status(404)
                .json({ message: 'Request not found' });
            return;
        }
        const recommendations = await Recommendation.find({ request_id: req.params.requestId });
        res.json(recommendations);
    } catch (err) {
        console.error(err);
        res.status(500)
            .json({ message: 'Error getting recommendations' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const recommendation = await Recommendation.findById(req.params.id);
        if (!recommendation) {
            res
                .status(404)
                .json({ message: 'Recommendation not found' });
        } else {
            res.json(recommendation);

        }
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error getting recommendation' });
    }

});

router.post('/', async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId);
        if (!request) {
            res
                .status(404)
                .json({ message: 'Request not found' });
            return;
        }
        const newRecommendation = new Recommendation({
            request_id: req.params.requestId,
            user_id: req.body.user_id,
            field1: req.body.field1,
            field2: req.body.field2,
            field3: req.body.field3,
        });
        const savedRecommendation = await newRecommendation.save();
        res.json(savedRecommendation);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error saving recommendation' });
    }
});

router.put('/', async (req, res) => {
    try {
        const savedRecommendation = await Recommendation.findByIdAndUpdate({ _id: req.body._id },
            {
                field1: req.body.field1,
                field2: req.body.field2,
                field3: req.body.field3,
            }, { new: true });
        if (!savedRecommendation) {
            res.status(404)
                .json({ message: 'Recommendation not found' });
        } else {
            res.json(savedRecommendation);
        }
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Error updating recommendation' });
    }
});


module.exports = router;
