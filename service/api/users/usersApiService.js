const tokenValidation = require("../../validation/tokenValidation");
const tokenService = require("../../token/tokenService");
const userService = require("../../user/userService");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");
const requestsServiceV2 = require("../../request/requestsServiceV2");
const userMetricsService = require("../../user/userMetricsService");

const { ForbiddenError, NotFoundError } = require("../../../errors/error");
const {
  verifySelfOrAdmin,
  verifySelf,
} = require("../../validation/privilegeValidation");
const User = require("../../../model/User");

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

const updateUser = async ({ params: { id = "" }, body: { avatar }, user }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser: user });

  // 1 - Get user
  const updatedUser = await User.findById(id);
  if (!updatedUser) throw new NotFoundError("User not found");

  // 2 - Update user
  updatedUser.avatar;

  // 3 - Save user and return
  return await updatedUser.save();
};

const updatePassword = async ({
  params: { id = "" },
  body: { oldPassword, newPassword },
  user,
}) => {
  // 1 - Verify user
  verifySelf({ userId: id, authenticatedUser: user });

  // 2 - Get user
  const dbUser = await User.findById(id);
  if (!dbUser) throw new NotFoundError("User not found");

  // 3 - Verify old password
  if (!dbUser.validPassword(oldPassword))
    throw new ForbiddenError("Old password is incorrect");

  // 4 - Update password
  dbUser.setPassword(newPassword);
  return await dbUser.save();
};

const getMe = async ({ user }) => {
  return user;
};

const getByName = async ({ params: { name = "" } }) => {
  const user = await User.findOne({
    name,
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const getRecommendations = async ({ params: { id = "" }, query, user }) => {
  // 1 - Get user
  const paramUser = await User.findById(id);
  if (!paramUser) throw new NotFoundError("User not found");

  // 2 - Check privileges
  if (paramUser.settings.privacy.privateRecommendations)
    verifySelfOrAdmin({ userId: id, authenticatedUser: user });

  const page = await recommendationsServiceV2.paginatedSearch({
    ...query,
    showDuplicates: true,
    user: paramUser,
  });

  return {
    ...page,
    results: page.results.map((recommendation) => ({
      ...recommendation.toJSON(),
      liked: recommendation.isLikedBy(user?.id),
    })),
  };
};

const getRequests = async ({ params: { id = "" }, query, user }) => {
  // 1 - Get user
  const paramUser = await User.findById(id);
  if (!paramUser) throw new NotFoundError("User not found");

  // 2 - Verify access
  if (paramUser.settings.privacy.privateRequests)
    verifySelfOrAdmin({ userId: id, authenticatedUser: user });

  // 3 - Get requests
  const page = await requestsServiceV2.paginatedSearch({
    ...query,
    user: paramUser,
  });

  // 4 - Return requests
  return page;
};

const getMetrics = async ({ params: { id = "" } }) => {
  // 1 - Get User
  const paramUser = await User.findById(id);
  if (!paramUser) throw new NotFoundError("User not found");

  const metrics = await userMetricsService.getMetrics(paramUser);
  return metrics;
};

module.exports = {
  signup,
  updateUser,
  updatePassword,
  getMe,
  getByName,
  getRecommendations,
  getRequests,
  getMetrics,
};
