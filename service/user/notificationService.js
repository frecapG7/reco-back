const Notification = require("../../model/Notification");

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
  createNotification,
};
