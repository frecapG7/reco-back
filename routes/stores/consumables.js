const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");

const consumableStoreService = require("../../service/api/stores/consumableStoreService");

router.get("", async (req, res, next) => {
  try {
    const result = await consumableStoreService.getConsumableItems();
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/buy",
  passport.authenticate("bearer", { session: false }),
  async () => {
    try {
      const result = await consumableStoreService.buyConsumable({
        id: req.params.id,
        authenticatedUser: req.user,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
