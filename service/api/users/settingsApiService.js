const { NotFoundError } = require("../../../errors/error");
const User = require("../../../model/User");
const constants = require("../../../constants");
const { verifySelfOrAdmin } = require("../../validation/privilegeValidation");

const toDto = (settings) => ({
  ...settings,
  isDefault: settings === constants.defaultSettings,
});

const getSettings = async ({ params: { id = "" }, user }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser: user });

  // 1 - Get user by id
  const paramUser = await User.findById(id);
  if (!paramUser) throw new NotFoundError("User not found");

  // 2 - Return settings
  // return user.settings;
  return toDto(paramUser.settings);
};

const updateSettings = async ({ params: { id = "" }, body, user }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser: user });

  // Get user by id
  const paramUser = await User.findById(id);
  if (!paramUser) throw new NotFoundError("User not found");

  paramUser.settings = body;

  // Save user and return
  const updatedUser = await paramUser.save();

  return toDto(updatedUser.settings);
};

const resetSettings = async ({ params: { id = "" }, user }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser: user });

  // Get user by id
  const paramUser = await User.findById(id);
  if (!paramUser) throw new NotFoundError("User not found");

  paramUser.settings = constants.defaultSettings;

  // Save user and return
  const updatedUser = await paramUser.save();

  return toDto(updatedUser.settings);
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};
