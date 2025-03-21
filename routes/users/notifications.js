const router = require("express").Router({ mergeParams: true });
const notificationService = require("../../service/api/users/notificationsApiService");

router.get("", async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/unread", async (req, res, next) => {
  try {
    const result = await notificationService.countUnread(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/read", async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(req);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/read/all", async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
