const router = require("express").Router({ mergeParams: true });
const purchase = require("../../service/api/users/purchases");

router.get("", async (req, res, next) => {
  try {
    const result = await purchase.getPurchases({
      id: req.params.userId,
      query: req.query,
      authenticatedUser: req.user,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:purchaseId", async (req, res, next) => {
  try {
    const result = await purchase.getPurchase({
      id: req.params.userId,
      purchaseId: req.params.purchaseId,
      authenticatedUser: req.user,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/:purchaseId/redeem", async (req, res, next) => {
  try {
    await purchase.redeemPurchase({
      id: req.params.userId,
      purchaseId: req.params.purchaseId,
      authenticatedUser: req.user,
    });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
