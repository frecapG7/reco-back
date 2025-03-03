const tokenValidation = require("../../validation/tokenValidation");
const tokenService = require("../../token/tokenService");
const userService = require("../../user/userService");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");
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

const updateUser = async ({ params: { id = "" }, body, user }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser: user });

  // 1 - Get user
  const updatedUser = await userService.getUser(id);

  // 2 - Update user
  await userService.updateUser(updatedUser, body);

  // 3 - Save user and return
  return await updatedUser.save();
};

const getRecommendations = async ({ params: { id = "" }, query, user }) => {
  // 1 - Get user
  const paramUser = await userService.getUser(id);

  // 2 - Check privileges
  if (paramUser.settings.privacy.privateRecommendations)
    throw verifySelfOrAdmin({ userId: id, authenticatedUser: user });

  const page = await recommendationsServiceV2.paginatedSearch({
    requestType: query.requestType || "",
    search: query.search || "",
    showDuplicates: true,
    user: paramUser,
    pageNumber: Number(query.pageNumber) || 1,
    pageSize: Number(query.pageSize) || 5,
  });

  return {
    ...page,
    results: page.results.map((recommendation) => ({
      ...recommendation.toJSON(),
      liked: recommendation.isLikedBy(user?.id),
    })),
  };
};

module.exports = {
  signup,
  updateUser,
  getRecommendations,
};
