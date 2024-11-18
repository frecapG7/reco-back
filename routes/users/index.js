const router = require("express").Router();
const passport = require("passport");

router.use("", require("./users"));
router.use(
  "/:userId/notifications",
  passport.authenticate("bearer", { session: false }),
  require("./notifications")
);

router.use("/:userId/purchases", require("./purchases"));

router.use("/signup", require("./signup"));
module.exports = router;
