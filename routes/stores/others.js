const express = require("express");
const router = express.Router({ mergeParams: true });

const consumableStoreService = require("../../service/api/stores/consumableStoreService");

router.post("/invitations/buy", async (req, res, next) => {
  try {
    const result = await consumableStoreService.buyInvitation({
      authenticatedUser: req.user,
    });

    return res.status(201).json(result).send();
  } catch (err) {
    next(err);
  }
});

router.post("/gifts/buy", async (req, res, next) => {
  try {
    const result = await consumableStoreService.buyGift({
      authenticatedUser: req.user,
    });

    return res.status(201).json(result).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
