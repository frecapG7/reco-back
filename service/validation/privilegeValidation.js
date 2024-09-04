const { UnAuthorizedError } = require("../../errors/error");

const verifyAdmin = (user) => {
  if (user?.role !== "ADMIN")
    throw new UnAuthorizedError(
      "You are not authorized to perform this action"
    );
};

module.exports = {
  verifyAdmin,
};
