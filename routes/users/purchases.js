const router = require("express").Router({ mergeParams: true });
const purchasesApiService = require("../../service/api/users/purchasesApiService");

router.get("", async (req, res, next) => {
  try {
    const result = await purchasesApiService.getPurchases(req);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:purchaseId", async (req, res, next) => {
  try {
    const result = await purchasesApiService.getPurchase(req);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/:purchaseId/redeem", async (req, res, next) => {
  try {
    await purchasesApiService.redeemPurchase(req);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const result = await purchasesApiService.createPurchase(req);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
