const express = require("express");
const router = express.Router();

const requestService = require("../../service/request/requestService");
const requestsApiService = require("../../service/api/requests/requestsApiService");
const passport = require("passport");

/**
 * Search requests
 */
router.get("", async (req, res, next) => {
  try {
    const page = await requestsApiService.search(req);
    return res.status(200).json(page);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /requests/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const request = await requestsApiService.getRequest(req);
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
  passport.authenticate(["bearer"], { session: false }),
  async (req, res, next) => {
    try {
      const request = await requestsApiService.createRequest(req);
      res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
