const express = require("express");
const router = express.Router();
const userService = require("../../service/user/userService");
const userSettingsService = require("../../service/user/userSettingsService");
const { ForbiddenError } = require("../../errors/error");

const passport = require("../../auth");

/**
 * POST /user to create new user
 */
router.post("", async (req, res, next) => {
  try {
    const savedUser = await userService.createUser(req.body, req.query?.token);
    return res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /user to get user by id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /user to update user
 */
router.put(
  "/:id",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      if (req.user._id !== req.params.id)
        throw new ForbiddenError("You cannot update other user");
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
      if (req.user._id !== req.params.id)
        throw new ForbiddenError("You cannot get other user settings");

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
      if (req.user._id !== req.params.id)
        throw new ForbiddenError("You cannot update other user settings");

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
      if (req.user._id !== req.params.id)
        throw new ForbiddenError("You cannot reset other user settings");

      const settings = await userSettingsService.resetSettings(req.params.id);

      return res.json(settings);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
