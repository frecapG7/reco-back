const { NotFoundError } = require("../../../errors/error");
const Notification = require("../../../model/Notification");

const { verifySelf } = require("../../validation/privilegeValidation");

const getNotifications = async ({
  params: { userId = "" },
  query: { hideRead = false, page = 1, pageSize = 50 },
  user,
}) => {
  verifySelf({ userId, authenticatedUser: user });

  const filters = {
    to: userId,
    ...(hideRead && { read: false }),
  };

  const totalResults = await Notification.countDocuments(filters);

  const notifications = await Notification.find(filters, null, {
    skip: (page - 1) * pageSize,
    limit: pageSize,
    sort: { createdAt: -1 },
  })
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

const countUnread = async ({ params: { userId }, user }) => {
  verifySelf({ userId, authenticatedUser: user });

  const unreadCount = await Notification.countDocuments({
    to: userId,
    read: false,
  });
  return {
    value: unreadCount,
  };
};

const markAsRead = async ({
  params: { userId = "", notificationId = "" },
  user,
}) => {
  verifySelf({ userId, authenticatedUser: user });
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

const markAllAsRead = async ({ params: { userId }, user }) => {
  verifySelf({ userId, authenticatedUser: user });
  const notifications = await Notification.updateMany(
    { to: userId },
    { read: true }
  );
  return notifications;
};

module.exports = {
  getNotifications,
  countUnread,
  markAsRead,
  markAllAsRead,
};
