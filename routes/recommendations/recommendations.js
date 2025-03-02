const express = require("express");
const router = express.Router();
const passport = require("../../auth");

const {
  create,
  get,
  getFromEmbed,
  search,
  like,
  unlike,
} = require("../../service/api/recommendations/recommendationsApiService");

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
/**
 * Get recommendation from an url link
 */
router.get("/embed", async (req, res, next) => {
  try {
    const recommendation = await getFromEmbed(req);
    res.status(200).json(recommendation);
  } catch (err) {
    next(err);
  }
});

/**
 * Create a recommendation
 */
router.post(
  "",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = await create(req);
      res.status(200).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Get recommendation by id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const recommendation = await get(req);
    res.status(200).json(recommendation);
  } catch (err) {
    next(err);
  }
});

/**
 * Like a recommendation
 */
router.post(
  "/:id/like",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = await like(req);
      res.status(200).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);
/**
 * Unlike a recommendation
 */
router.delete(
  "/:id/like",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = await unlike(req);
      res.status(200).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);
module.exports = router;
