const router = require("express").Router();

router.use("/icons", require("./icons"));

router.get("/items/:id", async (req, res, next) => {
  try {
    const result = await marketService.getItem({ id: req.params.id });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
