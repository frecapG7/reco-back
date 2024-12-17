const router = require("express").Router({ mergeParams: true });
const passport = require("../../auth");

const tokensApiService = require("../../service/api/tokens/tokensApiService");
/**
 * Create a new token
 */
router.post(
  "",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const token = await tokensApiService.createToken({
        body: req.body,
        authenticatedUser: req.user,
      });
      res.status(201).json(token);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const tokens = await tokensApiService.getTokens({
        query: req.query,
        authenticatedUser: req.user,
      });
      res.status(200).json(tokens);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
