const express = require("express");
const router = express.Router();

const {
  searchRecommendations,
} = require("../../service/recommendations/recommendationsService");

/**
 * Search recommendations
 */
router.get("", async (req, res, next) => {
  try {
    if (!Boolean(req.query.requestType))
      throw new Error("requestType is required");
    if (!Boolean(req.query.search)) throw new Error("search is required");
    const results = await searchRecommendations({
      requestType: req.query.requestType,
      search: req.query.search,
    });

    return res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
