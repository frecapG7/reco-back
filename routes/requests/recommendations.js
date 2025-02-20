const express = require("express");
const router = express.Router({ mergeParams: true });
const recommendationService = require("../../service/request/recommendationService");
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

router.get(
  "/:id",
  passport.authenticate(["bearer", "anonymous"], { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = await recommendationService.getRecommendation({
        recommendationId: req.params.id,
        authenticatedUser: req.user,
      });
      res.status(200).json(recommendation);
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

router.put(
  "/:id",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const recommendation = recommendationService.updateRecommendation({
        requestId: req.params.requestId,
        recommendationId: req.params.id,
        data: req.body,
        authenticatedUser: req.user,
      });

      res.status(204).json(recommendation);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      await recommendationService.deletedRecommendation(
        req.params.requestId,
        req.params.id,
        req.user
      );
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
