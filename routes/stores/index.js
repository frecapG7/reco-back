const router = require("express").Router();
const passport = require("passport");

router.use(
  "/icons",
  passport.authenticate("anonymous", { session: false }),
  require("./icons")
);

router.use(
  "/consumables",
  passport.authenticate("anonymous", { session: false }),
  require("./consumables")
);
module.exports = router;
