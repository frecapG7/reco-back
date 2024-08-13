const express = require("express");
const router = express.Router({ mergeParams: true });

const marketService = require("../../service/market/marketService");

const path = require("path");
const fs = require("fs");

// Load SVG file content as a string
const tmpIconPath = path.join("./", "assets", "tmpIcon.svg");
const tmpIcon = fs.readFileSync(tmpIconPath, "utf8");

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

router.get("/:id", async (req, res, next) => {
  console.log("GET /stores/icons/:id");
  return res.set("Content-Type", "image/svg+xml").send(tmpIcon);
});

module.exports = router;
