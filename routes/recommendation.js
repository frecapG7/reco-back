const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../validator/auth');
const recommendationService = require('../service/recommendationService');

router.get('', authenticateToken, async (req, res, next) => {
    try {
        const result = await recommendationService.getRecommendations(req.params.requestId, req.userId);
        res.status(200)
            .json(result);
    } catch (err) {
        next(err);
    }
});



router.get('/:id', async (req, res, next) => {
    try {
        const recommendation = await recommendationService.getRecommendation(req.params.id);
        res.status(200).json(recommendation);
    } catch (err) {
        next(err);
    }

});

router.post('/', authenticateToken, async (req, res, next) => {
    try {
        const recommendation = await recommendationService.createRecommendation(req.params.requestId, req.userId, req.body);
        res.status(201)
            .json(recommendation);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const recommendation = recommendationService.updateRecommendation(
            req.params.requestId,
            req.params.id,
            req.userId,
            req.body
        );

        res.status(204)
            .json(recommendation);
    } catch (err) {
        next(err);
    }
});



router.delete('/:id', async (req, res, next) => {
    try {
        await recommendationService.deletedRecommendation(
            req.params.requestId,
            req.params.id,
            req.userId
        );
    } catch (err) {
        next(err);
    }
});

// POST like
router.post("/:id/like", authenticateToken, async (req, res, next) => {
    try {
        const recommendation = await recommendationService.likeRecommendation(req.params.id, req.userId);
        res.status(200)
            .json(recommendation);
    } catch (err) {
        next(err);
    }
});
// DELETE like
router.delete("/:id/like", authenticateToken, async (req, res, next) => {
    try {
        const recommendation = await recommendationService.unlikeRecommendation(req.params.id, req.userId);
        res.status(200)
            .json(recommendation);
    } catch (err) {
        next(err);
    }

});



module.exports = router;
