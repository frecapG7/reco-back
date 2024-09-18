const router = require("express").Router({ mergeParams: true });
const passport = require("passport");
const purchase = require("../../service/api/users/purchases");

router.get(
  "",
  passport.authenticate(["bearer", "anonymous"], { session: false }),
  async (req, res, next) => {
    try {
      purchase.getPurchases({
        id: req.params.userId,
        authenticatedUser: req.user,
      });
    } catch (err) {
      next(err);
    }
  }
);
