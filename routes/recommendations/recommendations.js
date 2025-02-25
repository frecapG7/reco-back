const express = require("express");
const router = express.Router();
const passport = require("../../auth");

const {
  likeRecommendation,
  unlikeRecommendation,
} = require("../../service/recommendations/recommendationsService");
const {
  create,
  get,
  getFromEmbed,
  search,
} = require("../../service/api/recommendations/recommendationsApiService");

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

/**
 * Search recommendations
 */
router.get(
  "",
  passport.authenticate("anonymous", { session: false }),
  async (req, res, next) => {
    try {
      const page = await search(req);
      return res.status(200).json(page);
    } catch (err) {
      next(err);
    }
  }
);

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

router.get("/embed", async (req, res, next) => {
  try {
    const recommendation = await getFromEmbed(req);
    res.status(200).json(recommendation);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
