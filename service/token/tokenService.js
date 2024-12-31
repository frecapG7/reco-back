const Token = require("../../model/Token");

const getToken = async (value) => {
  const token = await Token.findOne({ value: String(value) });
  return token;
};

const flagAsUsed = async (token) => {
  await Token.findOneAndUpdate(
    {
      _id: token._id,
      used: false,
    },
    {
      used: true,
    }
  );
};

const search = async ({ filters, pageNumber, pageSize, populate }) => {
  const totalResults = await Token.countDocuments(filters);
  const page = await Token.find(filters)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .populate(populate)
    .exec();

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results: page,
  };
};

module.exports = {
  getToken,
  flagAsUsed,
  search,
};
