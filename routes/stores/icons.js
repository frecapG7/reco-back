const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");

const iconStoreService = require("../../service/api/stores/iconStoreService");

router.get("/trending", async (req, res, next) => {
  try {
    //TODO
    return res.status(200).json({ message: "TODO" });
  } catch (err) {
    next(err);
  }
});

router.get("", async (req, res, next) => {
  try {
    const result = await iconStoreService.getRecentsIcon({
      value: req.query.value,
      type: "IconItem",
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 10,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await iconStoreService.getIcon({
      id: req.params.id,
      authenticatedUser: req.user,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
