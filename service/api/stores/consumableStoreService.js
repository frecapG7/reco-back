const mongoose = require("mongoose");
const { INVITATION, GIFT } = require("./storesConstants");
const ConsumablePurchase = require("../../../model/purchase/ConsumablePurchase");
const creditService = require("../../market/creditService");

const buyInvitation = async ({ authenticatedUser }) => {
  let session;

  try {
    session = await mongoose.startSession();

    session.startTransaction();

    await creditService.removeCredit(INVITATION.price, authenticatedUser);

    const invitation = await new ConsumablePurchase({
      name: "Invitation",
      price: INVITATION.price,
      user: authenticatedUser,
    }).save();

    return invitation;
  } catch (err) {
    if (session) await session.abortTransaction();
    throw err;
  } finally {
    if (session) await session.endSession();
  }
};

const buyGift = async ({ authenticatedUser }) => {
  let session;

  try {
    session = await mongoose.startSession();

    session.startTransaction();

    await creditService.removeCredit(GIFT.price, authenticatedUser);

    const gift = await new ConsumablePurchase({
      name: "Gift",
      user: authenticatedUser,
    }).save();

    return gift;
  } catch (err) {
    if (session) await session.abortTransaction();
    throw err;
  } finally {
    if (session) await session.endSession();
  }
};

module.exports = {
  buyInvitation,
  buyGift,
};
