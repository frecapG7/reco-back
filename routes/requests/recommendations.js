const express = require("express");
const router = express.Router({ mergeParams: true });
const recommendationService = require("../../service/request/recommendationService");
const passport = require("../../auth");

router.get("", async (req, res, next) => {
  try {
    const result = await recommendationService.getRecommendations({
      requestId: req.params.requestId,
      sorted: req.query.sort || "likes",
      pageSize: Number(req.query.pageSize) || 10,
      pageNumber: Number(req.query.pageNumber) || 1,
      authenticatedUser: req.user,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const recommendation = await recommendationService.getRecommendation({
      recommendationId: req.params.id,
      authenticatedUser: req.user,
    });
    res.status(200).json(recommendation);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = await recommendationService.createRecommendation({
        requestId: req.params.requestId,
        data: req.body,
        authenticatedUser: req.user,
      });
      return res.status(201).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = recommendationService.updateRecommendation({
        requestId: req.params.requestId,
        recommendationId: req.params.id,
        data: req.body,
        authenticatedUser: req.user,
      });

      res.status(204).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      await recommendationService.deletedRecommendation(
        req.params.requestId,
        req.params.id,
        req.user
      );
    } catch (err) {
      next(err);
    }
  }
);

// POST like
router.post(
  "/:id/like",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = await recommendationService.likeRecommendation({
        recommendationId: req.params.id,
        authenticatedUser: req.user,
      });
      res.status(200).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);
// DELETE like
router.delete(
  "/:id/like",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = await recommendationService.unlikeRecommendation({
        recommendationId: req.params.id,
        authenticatedUser: req.user,
      });
      res.status(200).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
