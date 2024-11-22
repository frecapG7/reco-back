const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  search,
  getUserDetails,
  getLastRecommendations,
} = require("../../service/admin/usersAdminService");
const passport = require("../../auth");

router.get("/", async (req, res, next) => {
  try {
    const results = await search({
      filters: {
        ...(req.query?.search && { search: req.query.search }),
        ...(req.query?.name && { name: req.query.name }),
        ...(req.query?.email && { email: req.query.email }),
        ...(req.query?.role && { role: req.query.role }),
      },
      pageSize: parseInt(req.query.pageSize) || 10,
      pageNumber: parseInt(req.query.pageNumber) || 1,
      authenticatedUser: req.user,
    });

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
      const user = await getUserDetails({
        userId: req.params.userId,
        authenticatedUser: req.user,
      });

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
