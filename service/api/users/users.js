const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const User = require("../../../model/User");

const userService = require("../../user/userService");
const requestService = require("../../request/requestService");
const {
  verifySelfOrAdmin,
  verifySelf,
} = require("../../validation/privilegeValidation");

const getUser = async ({ id }) => {
  // 1 - Get user
  const user = await userService.getUser(id);

  return user;
};

const updatePassword = async ({ id, body, authenticatedUser }) => {
  // 1 - Verify user
  verifySelf({ userId: id, authenticatedUser });

  // 2 - Get user
  const user = await userService.getUser(id);

  // 3 - Verify old password
  if (!user.validPassword(body.oldPassword))
    throw new ForbiddenError("Old password is incorrect");

  // 4 - Update password
  user.setPassword(body.newPassword);
  return await user.save();
};

const updateAvatar = async ({ id, avatar, authenticatedUser }) => {
  // 1 - Verify user
  verifySelfOrAdmin({ userId: id, authenticatedUser });

  // 2 - Get user
  const user = await userService.getUser(id);

  // 3 - Update user
  user.avatar = avatar;
  return await user.save();
};

const getRequests = async ({
  id,
  authenticatedUser,
  pageSize,
  pageNumber,
  search,
  type,
  sort,
}) => {
  // 1 - Get user
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  if (
    !user._id.equals(authenticatedUser?._id) &&
    authenticatedUser?.role !== "ADMIN" &&
    user.settings.privacy.privateRequests
  )
    throw new ForbiddenError("User requests are private");

  // 2 - Get requests
  const page = await requestService.search({
    filters: {
      ...(search && { search }),
      ...(type && { requestType: type }),
      author: user,
    },
    pageSize,
    pageNumber,
  });
  return page;
};

const getSort = (sort) => {
  if (sort === "likes_asc") return { likes: 1 };
  if (sort === "likes_desc") return { likes: -1 };
  if (sort === "created_asc") return { created_at: 1 };
  if (sort === "created_desc") return { created_at: -1 };
  return { created_at: -1 };
};

module.exports = {
  getUser,
  updateAvatar,
  updatePassword,
  getRequests,
};
