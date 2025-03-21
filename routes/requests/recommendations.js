const express = require("express");
const router = express.Router({ mergeParams: true });
const requestApiService = require("../../service/api/requests/requestsApiService");
const passport = require("../../auth");

router.get(
  "",
  passport.authenticate(["bearer", "anonymous"], { session: false }),
  async (req, res, next) => {
    try {
      const result = await requestApiService.getRecommendations(req);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = await requestApiService.createRecommendation(req);
      return res.status(201).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
