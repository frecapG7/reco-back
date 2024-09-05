const express = require("express");
const router = express.Router({ mergeParams: true });

const marketService = require("../../service/market/marketService");

router.get("", async (req, res, next) => {
  try {
    const result = await marketService.searchItems({
      value: req.query.value,
      type: "IconItem",
      page: parseInt(req.query.page),
      pageSize: parseInt(req.query.pageSize),
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
