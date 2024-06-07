const express = require("express");
const router = express.Router({ mergeParams: true });
const recommendationService = require("../../service/request/recommendationService");
const passport = require("../../auth");

router.get("", async (req, res, next) => {
  try {
    const result = await recommendationService.getRecommendations(
      req.params.requestId,
      req.user
    );
    res.status(200).json(result);
  } catch (err) {
    next(errsou);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const recommendation = await recommendationService.getRecommendation(
      req.params.id
    );
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
      const recommendation = await recommendationService.createRecommendation(
        req.params.requestId,
        req.body,
        req.user
      );
      res.status(201).json(recommendation);
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
      const recommendation = recommendationService.updateRecommendation(
        req.params.requestId,
        req.params.id,
        req.user,
        req.body
      );

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
        req.use
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
      const recommendation = await recommendationService.likeRecommendation(
        req.params.id,
        req.user
      );
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
      const recommendation = await recommendationService.unlikeRecommendation(
        req.params.id,
        req.user
      );
      res.status(200).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
