const express = require("express");
const router = express.Router();
const userService = require("../../service/user/userService");

const users = require("../../service/api/users/users");
const userSettingsService = require("../../service/user/userSettingsService");
const { ForbiddenError } = require("../../errors/error");

const signup = require("../../service/api/users/signup");
const passport = require("../../auth");


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
      verifyUser(req.params.id, req.user);
      const user = await userService.updateUser(req.params.id, req.body);
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

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
      const requests = await users.getLastRequests({
        id: req.params.id,
        authenticatedUser: req.user,
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
      const recommendations = await users.getLastRecommendations({
        id: req.params.id,
        authenticatedUser: req.user,
      });
      return res.json(recommendations);
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
