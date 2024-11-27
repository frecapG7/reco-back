const router = require("express").Router({ mergeParams: true });

const followService = require("../../service/api/users/follows");

router.post("", async (req, res, next) => {
  try {
    const user = await followService.postFollow({
      id: req.params.userId,
      body: req.body,
      authenticatedUser: req.user,
    });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("", async (req, res, next) => {
  try {
    const page = await followService.getFollows({
      id: req.params.userId,
      pageNumber: Number(req.query.pageNumber) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      authenticatedUser: req.user,
    });
    return res.json(page);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

router.delete("/:deleteId", async (req, res, next) => {
  try {
    const user = await followService.removeFollow({
      id: req.params.userId,
      body: { userId: req.params.deleteId },
      authenticatedUser: req.user,
    });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
