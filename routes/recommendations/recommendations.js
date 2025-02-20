const express = require("express");
const router = express.Router();
const passport = require("../../auth");

const {
  searchRecommendations,
  likeRecommendation,
  unlikeRecommendation,
} = require("../../service/recommendations/recommendationsService");
const {
  create,
  get,
} = require("../../service/api/recommendations/recommendationsApiService");

/**
 * Search recommendations
 */
router.get(
  "",
  passport.authenticate("anonymous", { session: false }),
  async (req, res, next) => {
    try {
      if (!Boolean(req.query.requestType))
        throw new Error("requestType is required");
      const page = await searchRecommendations({
        requestType: req.query.requestType,
        search: req.query.search,
        pageNumber: Number(req.query.pageNumber) || 1,
        pageSize: Number(req.query.pageSize) || 5,
        authenticatedUser: req.user,
      });

      return res.status(200).json(page);
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
      const recommendation = await likeRecommendation({
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
      const recommendation = await unlikeRecommendation({
        recommendationId: req.params.id,
        authenticatedUser: req.user,
      });
      res.status(200).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * 20/02/2025
 * V2 endpoints
 */
router.get("/:id", async (req, res, next) => {
  try {
    const recommendation = await get(req);
    res.status(200).json(recommendation);
  } catch (err) {
    next(err);
  }
});

router.post("", async (req, res, next) => {
  try {
    const recommendation = await create(req);
    res.status(200).json(recommendation);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
