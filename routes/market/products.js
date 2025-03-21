const express = require("express");
const passport = require("../../auth");
const router = express.Router();

const {
  search,
  getByName,
} = require("../../service/api/market/productsApiService");

/**
 * Created on 02/03/2025
 * V2 Endpoints should clean up the code and make it more readable
 */

/**
 * Search for market items
 */
router.get("", async (req, res, next) => {
  try {
    const result = await search(req);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * Get a market item by its unique name, public
 */
router.get(
  "/:name",
  passport.authenticate("anonymous", { session: false }),
  async (req, res, next) => {
    try {
      const result = await getByName(req);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
