const express = require("express");
const router = express.Router();

const users = require("../../service/api/users/users");
const userApiService = require("../../service/api/users/usersApiService");
const tokensApiService = require("../../service/api/tokens/tokensApiService");
const userSettingsService = require("../../service/user/userSettingsService");
const { ForbiddenError } = require("../../errors/error");

const metrics = require("../../service/api/users/metrics");

const passport = require("../../auth");
const {
  resetPassword,
  forgottenPassword,
} = require("../../service/api/resetPassword");

router.post("", async (req, res, next) => {
  try {
    const newUser = await userApiService.signup(req);
    return res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /user to get user by id
 */
router.get(
  "/:id",
  passport.authenticate(["bearer", "anonymous"], { session: false }),
  async (req, res, next) => {
    try {
      const user = await users.getUser({
        id: req.params.id,
        authenticatedUser: req.user,
      });
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /user to update user
 */
router.put(
  "/:id",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const user = await userApiService.updateUser(req);
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// Deprecated
// Use PUT /users/:id
router.put(
  "/:id/avatar",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const user = await users.updateAvatar({
        id: req.params.id,
        avatar: req.body.avatar,
      });
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id/password",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const user = await users.updatePassword({
        id: req.params.id,
        body: req.body,
        authenticatedUser: req.user,
      });
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/forgot-password", async (req, res, next) => {
  try {
    await forgottenPassword(req.body.email);
    return res.status(200).send();
  } catch (err) {
    next(err);
  }
});
router.post("/reset-password", async (req, res, next) => {
  try {
    await resetPassword(req.body.newPassword, req.body.token);
    return res.status(200).send();
  } catch (err) {
    next(err);
  }
});

/** SETTINGS ROUTES */

router.get(
  "/:id/settings",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      verifyUser(req.params.id, req.user);
      const settings = await userSettingsService.getSettings(req.params.id);

      return res.json(settings);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id/settings",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      verifyUser(req.params.id, req.user);
      const settings = await userSettingsService.updateSettings(
        req.params.id,
        req.body
      );

      return res.json(settings);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id/settings",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      verifyUser(req.params.id, req.user);
      const settings = await userSettingsService.resetSettings(req.params.id);

      return res.json(settings);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:id/requests",
  passport.authenticate(["bearer", "anonymous"], { session: false }),
  async (req, res, next) => {
    try {
      const requests = await users.getRequests({
        id: req.params.id,
        authenticatedUser: req.user,
        search: req.query?.search,
        type: req.query?.type,
        pageSize: Number(req.query?.pageSize) || 10,
        pageNumber: Number(req.query?.pageNumber) || 1,
      });
      return res.json(requests);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:id/recommendations",
  passport.authenticate(["bearer", "anonymous"], { session: false }),
  async (req, res, next) => {
    try {
      const recommendations = await userApiService.getRecommendations(req);
      return res.json(recommendations);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:id/metrics",
  passport.authenticate(["bearer"], { session: false }),
  async (req, res, next) => {
    try {
      const result = await metrics.getMetrics({
        id: req.params.id,
        authenticatedUser: req.user,
      });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
);
router.get(
  "/:id/balance",
  passport.authenticate(["bearer"], { session: false }),
  async (req, res, next) => {
    try {
      const result = await metrics.getBalance({
        id: req.params.id,
        detailled: req.query?.detailled,
        authenticatedUser: req.user,
      });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:id/tokens",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const tokens = await tokensApiService.getUserTokens({
        userId: req.params.id,
        query: req.query,
        authenticatedUser: req.user,
      });
      return res.json(tokens);
    } catch (err) {
      next(err);
    }
  }
);

const verifyUser = (id, authenticatedUser) => {
  if (!authenticatedUser._id.equals(id))
    throw new ForbiddenError("You cannot access other user settings");
};

module.exports = router;
