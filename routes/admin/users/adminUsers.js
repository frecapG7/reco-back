const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  search,
  get,
} = require("../../../service/api/admin/adminUsersApiService");

router.get("/", async (req, res, next) => {
  try {
    const results = await search(req);

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await get(req);

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
