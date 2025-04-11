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
  getProviders,
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

router.get("/providers", async (req, res, next) => {
  try {
    const providers = await getProviders(req);
    return res.status(200).json(providers);
  } catch (err) {
    next(err);
  }
});

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
