const tokenValidation = require("../../validation/tokenValidation");
const tokenService = require("../../token/tokenService");
const mongoose = require("mongoose");
const { ForbiddenError } = require("../../../errors/error");
const userService = require("../../user/userService");

const signup = async ({ data }) => {
  //1 - a check token validity
  await tokenValidation.validateToken(data.token);

  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 1 - Fetch token and check validity
    // Object must be fetch during the same session as the transaction
    const token = await tokenService.getToken(data.token);
    if (token.type !== "ACCOUNT_CREATION")
      throw new ForbiddenError("Invalid token");

    await tokenService.flagAsUsed(token);

    const user = await userService.createUser({
      name: data.name,
      password: data.password,
      confirmPassword: data.confirmPassword,
      icon_id: data.icon_id,
    });

    await session.commitTransaction();

    return user;
  } catch (err) {
    await session?.abortTransaction();
    throw err;
  } finally {
    await session?.endSession();
  }
};

module.exports = {
  signup,
};
