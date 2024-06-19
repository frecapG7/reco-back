const router = require("express").Router({ mergeParams: true });
const notificationService = require("../../service/user/notificationService");
const { ForbiddenError } = require("../../errors/error");

const verifyUser = (req) => {
  if (!req.user._id.equals(req.params.userId))
    throw new ForbiddenError("You canno1t get notifications for other user");
};

router.get("", async (req, res, next) => {
  try {
    verifyUser(req);

    const result = await notificationService.getNotifications({
      userId: req.params.id,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/read", async (req, res, next) => {
  try {
    verifyUser;
    const result = await notificationService.markAsRead({
      userId: req.params.userId,
      notificationId: req.params.id,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/read/all", async (req, res, next) => {
  try {
    verifyUser(req);
    const result = await notificationService.markAllAsRead({
      userId: req.params.userId,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
