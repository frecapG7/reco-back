const {
  NotFoundError,
  UnprocessableEntityError,
} = require("../../../errors/error");
const User = require("../../../model/User");
const Follow = require("../../../model/users/Follow");
const { verifySelfOrAdmin } = require("../../validation/privilegeValidation");

const postFollow = async ({ id, body, authenticatedUser }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser });

  if (!body?.userId) throw new UnprocessableEntityError("userId is required");
  if (id === body.userId)
    throw new UnprocessableEntityError("You can't follow yourself");

  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  const follow = await User.findById(body.userId);
  if (!follow) throw new NotFoundError("User to follow not found");

  if (user.follows.includes(follow))
    throw new UnprocessableEntityError("You are already following this user");

  user.follows.push({ user: body.userId });
  return await user.save();
};

const getFollows = async ({
  id,
  pageNumber = 1,
  pageSize = 10,
  authenticatedUser,
}) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser });

  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  await user.populate("follows.user");

  const results = user.follows
    ?.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
    .map((follow) => ({
      id: follow.user.id,
      name: follow.user.name,
      avatar: follow.user.avatar,
      addedAt: follow.addedAt,
      hidden: follow.hidden,
    }));

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(user.follows.length / pageSize),
      totalResults: user.follows.length,
    },
    results,
  };
};

const removeFollow = async ({ id, body, authenticatedUser }) => {
  verifySelfOrAdmin({ userId: id, authenticatedUser });

  if (!body?.userId) throw new UnprocessableEntityError("userId is required");
  if (id === body.userId)
    throw new UnprocessableEntityError("You can't unfollow yourself");

  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  user.follows = user.follows.filter(
    (follow) => !follow.user?.equals(body.userId)
  );
  return await user.save();
};

module.exports = {
  postFollow,
  getFollows,
  removeFollow,
};
