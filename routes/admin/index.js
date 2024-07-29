const express = require("express");
const users = require("./users");

const items = require("./market/items");
const passport = require("../../auth");
const router = express.Router({ mergeParams: true });

const adminService = require("../../service/admin/adminService");

router.post("/token", async (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      throw new ForbiddenError("You cannot generate token");

    const token = await adminService.createToken(req.body);

    res.status(201).json(token);
  } catch (err) {
    next(err);
  }
});

router.use("/users", users);

router.use("/market/items", items);

module.exports = router;
