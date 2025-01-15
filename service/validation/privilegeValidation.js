const { UnAuthorizedError } = require("../../errors/error");

const verifyAdmin = (user) => {
  if (user?.role !== "ADMIN")
    throw new UnAuthorizedError(
      "You are not authorized to perform this action"
    );
};

const verifySelfOrAdmin = ({ userId, authenticatedUser }) => {
  if (
    !authenticatedUser?._id?.equals(userId) &&
    authenticatedUser?.role !== "ADMIN"
  )
    throw new UnAuthorizedError(
      "You are not authorized to perform this action"
    );
};

const verifySelf = ({ userId, authenticatedUser }) => {
  if (!authenticatedUser?._id?.equals(userId)) {
    throw new UnAuthorizedError(
      "You are not authorized to perform this action"
    );
  }
};

module.exports = {
  verifyAdmin,
  verifySelfOrAdmin,
  verifySelf,
};
