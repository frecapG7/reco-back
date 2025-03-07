const { verifyAdmin } = require("../../validation/privilegeValidation");
const userService = require("../../user/userService");

const search = async ({ query, user }) => {
  verifyAdmin(user);

  const result = await userService.paginatedSearch(query);

  return result;
};

const get = async ({ params: { id = "" }, user }) => {
  verifyAdmin(user);

  const result = await userService.getUser(id);

  return result;
};

module.exports = {
  search,
  get,
};
