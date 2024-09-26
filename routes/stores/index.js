const router = require("express").Router();

const marketService = require("../../service/market/marketService");

router.use("/icons", require("./icons"));

router.get("/items/:id", async (req, res, next) => {
  try {
    const result = await marketService.getItem({ id: req.params.id });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.use("/consumables", require("./consumables"));
router.use("/others", require("./others"));
module.exports = router;
