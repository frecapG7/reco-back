const router = require("express").Router({ mergeParams: true });
const passport = require("passport");
const purchase = require("../../service/api/users/purchases");

router.get(
  "",
  passport.authenticate(["bearer", "anonymous"], { session: false }),
  async (req, res, next) => {
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
  }
);

router.get(
  "/:purchaseId",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
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
  }
);

module.exports = router;
