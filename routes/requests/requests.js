const express = require("express");
const router = express.Router();

const requestService = require("../../service/request/requestService");
const passport = require("passport");

/**
 * GET /requests/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const request = await requestService.getRequest(req.params.id);
    res.status(200).json(request);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /requests
 */
router.post(
  "",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const request = await requestService.createRequest(req.body, req.user);
      res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /requests/:id
 */
router.put(
  "/:id",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const savedRequest = requestService.updateRequest(
        req.params.id,
        req.body,
        req.user
      );
      res.status(200).json(savedRequest);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /requests/:id
 */
router.delete(
  "/:id",
  passport.authenticate("bearer", { session: false }),
  async (req, res) => {
    try {
      const request = requestService.deleteRequest(req.params.id, req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

/**
 *
 */
router.get(
  "",
  passport.authenticate(["bearer", "anonymous"], { session: false }),
  async (req, res, next) => {
    try {
      const pageNumber = parseInt(req.query.pageNumber) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      const results = await requestService.search({
        filters: {
          ...(req.query.type && { requestType: req.query.type }),
          ...(req.query.status && { status: req.query.status }),
          ...(req.query.me && req.user && { author: req.user._id }),
        },
        pageSize,
        pageNumber,
      });
      return res.json(results);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
