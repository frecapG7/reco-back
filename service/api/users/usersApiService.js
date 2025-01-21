const tokenValidation = require("../../validation/tokenValidation");
const tokenService = require("../../token/tokenService");
const userService = require("../../user/userService");
const { ForbiddenError } = require("../../../errors/error");
const { verifySelfOrAdmin } = require("../../validation/privilegeValidation");

const signup = async (req) => {
  //1 - a check token validity
  await tokenValidation.validateToken(req.query?.token);

  // 1 - Fetch token and check validity
  const token = await tokenService.getToken(req.query?.token);
  if (token.type !== "ACCOUNT_CREATION")
    throw new ForbiddenError("Invalid token");

  // 2 - Create user
  const user = await userService.createUser(req.body);

  // 3 - Flag token as used
  token.used = true;
  await token.save();

  // 4 - Return user
  const savedUser = await user.save();
  return savedUser;
};

const updateUser = async (req) => {
  verifySelfOrAdmin({ userId: req.params.id, authenticatedUser: req.user });

  // 1 - Get user
  const user = await userService.getUser(req.params.id);

  // 2 - Update user
  await userService.updateUser(user, req.body);

  // 3 - Save user and return
  return await user.save();
};

module.exports = {
  signup,
  updateUser,
};
