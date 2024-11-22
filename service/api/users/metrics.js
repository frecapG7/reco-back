const { NotFoundError } = require("../../../errors/error");
const User = require("../../../model/User");
const { verifySelfOrAdmin } = require("../../validation/privilegeValidation");
const userMetricsService = require("../../user/userMetricsService");

const getMetrics = async ({ id, authenticatedUser }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser });

  const user = await User.findById(id);
  if (!user) throw new NotFoundError(`Cannot find user with id ${id}`);

  const metrics = await userMetricsService.getMetrics(user);

  return metrics;
};

const getBalance = async ({ id, detailled = false, authenticatedUser }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser });

  const user = await User.findById(id);
  if (!user) throw new NotFoundError(`Cannot find user with id ${id}`);

  const balance = await userMetricsService.getBalance(user, detailled);

  return balance;
};

module.exports = {
  getMetrics,
  getBalance,
};
