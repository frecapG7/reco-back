const express = require("express");
const router = express.Router();

const request = require("./request");
const recommendation = require("./requests/recommendations");

const recommendations = require("./recommendations");
const user = require("./user");
const cart = require("./cart");
const validation = require("./validation");
const admin = require("./admin");
const oauth = require("./oauth2");
const embed = require("./embed");

const passport = require("../auth");

// ********** Routes **********

// ********** Request **********
router.use("/requests", request);
router.use("/requests/:requestId/recommendations", recommendation);
router.use("/recommendations", recommendations);

// ********** User **********
router.use("/users", user);
router.use(
  "/users/:userId/cart",
  passport.authenticate("bearer", { session: false }),
  cart
);

router.use("/validate", validation);

// ********** Embed **********
router.use("/embed", embed);

// ********** Admin **********
router.use(
  "/admin",
  passport.authenticate("bearer", { session: false }),
  admin
);

// ********** Authentication **********
router.use("/auth", oauth);

module.exports = router;
