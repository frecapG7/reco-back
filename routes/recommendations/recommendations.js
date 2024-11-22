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
    const page = await searchRecommendations({
      requestType: req.query.requestType,
      search: req.query.search,
      pageNumber: Number(req.query.pageNumber) || 1,
      pageSize: Number(req.query.pageSize) || 5,
    });

    return res.status(200).json(page);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
