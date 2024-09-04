const { generateRandom } = require("../../utils/utils");
const { verifyAdmin } = require("../validation/privilegeValidation");
const Token = require("../../model/Token");

const createToken = async ({ data, authenticatedUser }) => {
  await verifyAdmin(authenticatedUser);
  const value = await generateRandom(4);

  const token = new Token({
    value: value,
    type: data.type,
  });

  const savedToken = await token.save();

  return savedToken;
};

module.exports = {
  createToken,
};
