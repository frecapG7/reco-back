const express = require("express");
const router = express.Router();
const signup = require("../../service/api/users/signup");

/**
 * POST /user to create new user
 */
router.post("", async (req, res, next) => {
  try {
    const savedUser = await signup.signup(req.body);
    return res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
});

router.get("/avatars", async (req, res, next) => {
  try {
    const avatars = await signup.getAvatars();
    return res.json(avatars);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
