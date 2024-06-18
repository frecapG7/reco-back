const { NotFoundError } = require("../../errors/error");
const Notification = require("../../model/Notification");

const getNotifications = async ({ userId }) => {
  const notifications = await Notification.find({ user: userId });
  return notifications;
};

const markAsRead = async ({ userId, notificationId }) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      user: userId,
    },
    {
      read: true,
    },
    { new: true }
  );

  if (!notification) throw new NotFoundError("Notification not found");
  return notification;
};

const markAllAsRead = async ({ userId }) => {
  const notifications = await Notification.updateMany(
    { user: userId },
    { read: true }
  );
  return notifications;
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
