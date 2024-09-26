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
  async () => {}
);

module.exports = router;
