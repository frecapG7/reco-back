const express = require("express");
const router = express.Router();
const marketAdminApiService = require("../../../service/api/admin/marketAdminApiService");

const logger = require("../../../logger");

/**
 * Admin search for all market items
 */
router.get("", async (req, res, next) => {
  try {
    logger.debug("Administration : Searching market items");
    const page = await marketAdminApiService.search(req);
    return res.status(200).json(page);
  } catch (err) {
    next(err);
  }
});

/**
 *
 */
router.get("/:id", async (req, res, next) => {
  try {
    logger.debug("Administration : Getting market item");
    const item = await marketAdminApiService.get(req);
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    logger.info(`Administration : Updating market item ${req.params.id}`);
    const item = await marketAdminApiService.update(req);
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

router.post("", async (req, res, next) => {
  try {
    logger.info("Administration : Creating market item");
    const item = await marketAdminApiService.create(req);
    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.post("/verify-name", async (req, res, next) => {
  try {
    await marketAdminApiService.verifyUniqueName(req);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
