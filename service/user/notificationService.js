const { NotFoundError } = require("../../errors/error");
const Notification = require("../../model/Notification");

const getNotifications = async ({
  userId,
  hideRead = false,
  page = 1,
  pageSize = 50,
}) => {
  const filters = {
    to: userId,
    ...(hideRead && { read: false }),
  };

  const totalResults = await Notification.countDocuments(filters);

  const notifications = await Notification.find(filters)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .populate("from", "name")
    .exec();
  return {
    results: notifications.map((notification) => ({
      id: notification._id,
      from: {
        id: notification.from._id,
        name: notification.from.name,
      },
      read: notification.read,
      type: notification.type,
      createdAt: notification.createdAt,
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
  };
};

const countUnread = async ({ userId }) => {
  const unreadCount = await Notification.countDocuments({
    to: userId,
    read: false,
  });
  return {
    value: unreadCount,
  };
};

const markAsRead = async ({ userId, notificationId }) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      to: userId,
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
    { to: userId },
    { read: true }
  );
  return notifications;
};

const createNotification = async ({ to, from, type }) => {
  const notification = new Notification({
    to,
    from,
    type,
  });

  await notification.save();
  return notification;
};

module.exports = {
  getNotifications,
  countUnread,
  markAsRead,
  markAllAsRead,
  createNotification,
};
