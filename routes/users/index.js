const router = require("express").Router();
const passport = require("passport");

router.use("", require("./users"));
router.use(
  "/:userId/notifications",
  passport.authenticate("bearer", { session: false }),
  require("./notifications")
);

module.exports = router;
