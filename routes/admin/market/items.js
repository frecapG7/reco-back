const express = require("express");

const router = express.Router();
const marketAdminService = require("../../../service/admin/marketAdminService");

router.post("/icons", async (req, res, next) => {
  try {
    const result = await marketAdminService.createIconItem({
      data: req.body,
      authenticatedUser: req?.user,
    });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/consumables", async (req, res, next) => {
  try {
    const result = await marketAdminService.createConsumableItem({
      data: req.body,
      authenticatedUser: req?.user,
    });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:itemsId", async (req, res, next) => {
  try {
    const result = await marketAdminService.getMarketItem({
      itemId: req.params.itemsId,
      authenticatedUser: req.user,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await marketAdminService.searchItems({
      value: req.query.value,
      type: req.query.type,
      page: parseInt(req.query.page),
      pageSize: parseInt(req.query.pageSize),
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const result = await marketAdminService.updateItem({
      id: req.params.id,
      data: req.body,
      authenticatedUser: req?.user,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
