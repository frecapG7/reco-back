const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  search,
  getUserDetails,
  getLastRequests,
  getLastRecommendations,
} = require("../../service/admin/usersAdminService");
const passport = require("../../auth");

router.get("/", async (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      throw new ForbiddenError("You cannot generate token");

    const results = await search(
      {
        filters: {
          ...(req.query?.search && { search: req.query.search }),
          ...(req.query?.name && { name: req.query.name }),
          ...(req.query?.email && { email: req.query.email }),
          ...(req.query?.role && { role: req.query.role }),
        },
        pageSize: parseInt(req.query.pageSize) || 10,
        pageNumber: parseInt(req.query.pageNumber) || 1,
        authenticatedUser: req.user,
      },
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

      const user = await getUserDetails(req.params.userId);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:userId/requests", async (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      throw new ForbiddenError("You cannot generate token");

    const request = await getLastRequests(req.params.userId);
    return res.status(200).json(request);
  } catch (error) {
    next(error);
  }
});

router.get("/:userId/recommendations", async (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      throw new ForbiddenError("You cannot generate token");

    const recommendation = await getLastRecommendations(req.params.userId);
    return res.status(200).json(recommendation);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
