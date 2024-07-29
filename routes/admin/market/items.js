const express = require("express");

const router = express.Router();
const marketAdminService = require("../../../service/admin/marketAdminService");
router.post("", async (req, res, next) => {
  try {
    const result = await marketAdminService.createMarketItem({
      item: req.body,
      authenticatedUser: req?.user,
    });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:itemsId", async (req, res, next) => {
  try {
    const result = await marketAdminService.getMarketItem(
      req.params.itemsId,
      req.user
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {

    console.log("")

  } catch (err) {
    next(err);
  }
});

module.exports = router;
