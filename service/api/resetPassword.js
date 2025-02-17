const logger = require("../../logger");
const { NotFoundError } = require("../../errors/error");
const { generateRandom } = require("../../utils/utils");
const { sendResetPasswordEmail } = require("../../emails/emails");
const User = require("../../model/User");

const Token = require("../../model/Token");

const resetPassword = async (newPassword, tokenValue) => {
  // 1 - Find Token
  const token = await Token.findOne({
    value: tokenValue,
    used: false,
    expiration: { $gte: new Date() },
  });
  if (!token) throw new NotFoundError("Token not found");

  // 2 - Get user linked to token
  await token.populate("created_by");
  const user = token.created_by;
  user.setPassword(newPassword);

  // 3 - Mark token as used
  token.used = true;
  await token.save();

  // 4 - Save user
  await user.save();
};

const forgottenPassword = async (email) => {
  // 1 - Find User by email
  const user = await User.findOne({
    email,
  });
  if (!user) return;

  // 2 - Generate Token
  const token = new Token({
    created_by: user,
    value: generateRandom(6),
    type: "PASSWORD_RESET",
  });

  // 3 - Save Token
  await token.save();

  logger.info(`Sending reset password email to ${user.email}`);
  // 4 - Send email
  await sendResetPasswordEmail(user.name, user.email, token.value);
};

module.exports = {
  resetPassword,
  forgottenPassword,
};
