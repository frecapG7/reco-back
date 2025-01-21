const express = require("express");
const router = express.Router();
const passport = require("../../auth");

const {
  searchRecommendations,
  likeRecommendation,
  unlikeRecommendation,
} = require("../../service/recommendations/recommendationsService");

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
      if (!Boolean(req.query.search)) throw new Error("search is required");
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

module.exports = router;
