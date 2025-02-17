const { ForbiddenError, NotFoundError } = require("../../../errors/error");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const Token = require("../../../model/Token");
const { generateRandom } = require("../../../utils/utils");
const userService = require("../../user/userService");
const tokenService = require("../../token/tokenService");
const {
  verifySelfOrAdmin,
  verifyAdmin,
} = require("../../validation/privilegeValidation");

/**
 * TODO: transactionnal context
 */
const createToken = async ({ body, authenticatedUser }) => {
  // 1 - Verify user is admin or self
  verifySelfOrAdmin({ userId: body.created_by?.id, authenticatedUser });
  // 2 - Find user author
  const user = await userService.getUser(body.created_by?.id);

  // 3 - Find InvitationPurchase to debit
  const invitationPurchase = await PurchaseItem.findOne({
    user,
    type: "ConsumablePurchase",
    consumableType: "invitation",
  });
  if (parseInt(invitationPurchase?.quantity || 0) === 0)
    throw new ForbiddenError("Not enough invitations");

  // 4 - Create token
  const token = new Token({
    value: generateRandom(6),
    created_by: user,
    type: "invitation",
  });

  // 5 - Save token
  const savedToken = await token.save();

  // 6 - Debit invitation
  invitationPurchase.quantity -= 1;
  await invitationPurchase.save();

  return savedToken;
};

const getTokens = async ({ query, authenticatedUser }) => {
  // verify admin
  verifyAdmin(authenticatedUser);

  // find all tokens with pagination
  return await tokenService.search({
    filters: {
      ...(query.type && { type: query.type }),
      ...(query.created_by && { created_by: query.created_by }),
    },
    pageNumber: parseInt(query?.pageNumber) || 1,
    pageSize: parseInt(query?.pageSize) || 10,
    populate: "created_by",
  });
};

const getUserTokens = async ({ userId, query, authenticatedUser }) => {
  verifySelfOrAdmin({ userId, authenticatedUser });

  const user = await userService.getUser(userId);

  return await tokenService.search({
    filters: {
      created_by: user,
      type: "ACCOUNT_CREATION",
    },
    pageNumber: parseInt(query?.pageNumber) || 1,
    pageSize: parseInt(query?.pageSize) || 10,
  });
};

const getToken = async ({ id }) => {
  const token = await tokenService.getToken(id);

  if (!token) throw new NotFoundError("Token not found");

  return token;
};

module.exports = {
  createToken,
  getTokens,
  getUserTokens,
  getToken,
};
