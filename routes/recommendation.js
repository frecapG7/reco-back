const express = require('express');
const router = express.Router({ mergeParams: true });


const Request = require('../model/Request');
const Recommendation = require('../model/Recommendation');
const { authenticateToken } = require('../validator/auth');
const recommendationService = require('../service/recommendationService');

router.get('', async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId);
        if (!request) {
            res
                .status(404)
                .json({ message: `Cannot find request with id ${req.params.requestId}` });
            return;
        }
        const result = await recommendationService.getRecommendations(request, req.userId);
        res.status(200)
            .json(result);
    } catch (err) {
        console.error(err);
        res.status(500)
            .json({ message: 'Internal server error' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const recommendation = await Recommendation.findById(req.params.id);
        if (!recommendation) {
            res
                .status(404)
                .json({ message: `Cannot find recommendation with id ${req.params.id}` });
        } else {
            res.json(recommendation);

        }
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Internal server error' });
    }

});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId);
        if (!request) {
            res
                .status(404)
                .json({ message: `Cannot find request with id ${req.params.requestId}` });
            return;
        }
        const newRecommendation = new Recommendation({
            request_id: req.params.requestId,
            user_id: req.userId,
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
        const savedRecommendation = await Recommendation.findByIdAndUpdate(
            {
                _id: req.body.id,
                user_id: req.userId
            },
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



router.delete('/:id', async (req, res) => {
    try {
        const deletedRecommendation = await Recommendation.findByIdAndDelete(req.params.id);
        if (!deletedRecommendation) {
            res.status(404)
                .json({ message: 'Recommendation not found' });
        } else {
            res.status(200);
        }
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Internal server error' });
    }
});

// POST like
router.post("/:id/like", authenticateToken, async (req, res) => {
    try {
        const recommendation = await recommendationService.likeRecommendation(req.params.id, req.userId);
        res.status(200)
            .json(recommendation);
    } catch (err) {
        console.error(err);
        res
            .status(err.statusCode || 500)
            .json({ message: err?.message || 'Internal server error' });
    }
});
// DELETE like
router.delete("/:id/like", authenticateToken, async (req, res) => {
    try {
        const recommendation = await recommendationService.unlikeRecommendation(req.params.id, req.userId);
        res.status(200)
            .json(recommendation);
    } catch (err) {
        console.error(err);
        res
            .status(err?.statusCode || 500)
            .json({ message: err?.message || 'Internal server error' });
    }

});



module.exports = router;
