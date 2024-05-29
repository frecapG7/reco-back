const express = require("express");
const router = express.Router({ mergeParams: true });
const { search, getUser } = require("../../service/admin/usersAdminService");
const passport = require("../../auth");

router.get("/", async (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      throw new ForbiddenError("You cannot generate token");

    const results = await search(
      { ...(req.query?.search && { search: req.query.search }) },
      parseInt(req.query.pageSize) || 10,
      parseInt(req.query.pageNumber) || 1
    );

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:userId",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      if (req.user.role !== "admin")
        throw new ForbiddenError("You cannot generate token");

      const user = await getUser(req.params.userId);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
