const { NotFoundError } = require("../../errors/error");
const User = require("../../model/User");

const search = async (filters, pageSize, pageNumber) => {
  const totalResults = await User.countDocuments();

  const results = await User.find(filters)
    .skip(pageSize * (pageNumber - 1))
    .limit(pageSize)
    .exec();

  console.log(Math.ceil(totalResults / pageSize));
  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results: results?.map((result) => result.toJSON()),
  };
};

const getUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new NotFoundError("User not found");

  return user.toJSON();
};

module.exports = {
  search,
  getUser,
};
