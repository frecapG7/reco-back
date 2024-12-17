const express = require("express");
const router = express.Router();

const requests = require("./requests");

const recommendations = require("./recommendations");

const users = require("./users");
const cart = require("./cart");
const validation = require("./validation");
const admin = require("./admin");
const oauth = require("./oauth2");
const embed = require("./embed");

const stores = require("./stores");
const tokens = require("./tokens");
const passport = require("../auth");

// ********** Routes **********

// ********** Request **********
router.use("/requests", requests);

router.use("/recommendations", recommendations);

// ********** User **********
router.use("/users", users);
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

// ********** Stores **********
router.use("/stores", stores);

// ********** Authentication **********
router.use("/auth", oauth);

// ********** Tokens **********
router.use("/tokens", tokens);

module.exports = router;
