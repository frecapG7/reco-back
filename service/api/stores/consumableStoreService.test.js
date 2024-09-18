const sinon = require("sinon");

const { buyInvitation, buyGift } = require("./consumableStoreService");
const mongoose = require("mongoose");
const creditService = require("../../market/creditService");
const ConsumablePurchase = require("../../../model/purchase/ConsumablePurchase");

const sessionStub = {
  startTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};
sinon.stub(mongoose, "startSession").returns(sessionStub);
describe("Test buyInvitation", () => {
  let removeCreditStub;
  let saveStub;

  beforeEach(() => {
    removeCreditStub = sinon.stub(creditService, "removeCredit");
    saveStub = sinon.stub(ConsumablePurchase.prototype, "save");
  });
  afterEach(() => {
    removeCreditStub.restore();
    saveStub.restore();
  });

  it("Should rollback transaction", async () => {
    removeCreditStub.throws();

    await expect(
      buyInvitation({
        authenticatedUser: {
          _id: "23564",
        },
      })
    ).rejects.toThrow();

    //Verify transaction
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should buy item", async () => {
    removeCreditStub.returns(true);
    saveStub.returnsThis();

    const result = await buyInvitation({
      authenticatedUser: {
        _id: "23564",
      },
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Invitation");
    expect(result.price).toBe(10);

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });
});

describe("Test buyGift", () => {
  let removeCreditStub;
  let saveStub;

  beforeEach(() => {
    removeCreditStub = sinon.stub(creditService, "removeCredit");
    saveStub = sinon.stub(ConsumablePurchase.prototype, "save");
  });
  afterEach(() => {
    removeCreditStub.restore();
    saveStub.restore();
  });

  it("Should rollback transaction", async () => {
    removeCreditStub.throws();

    await expect(
      buyGift({
        authenticatedUser: {
          _id: "23564",
        },
      })
    ).rejects.toThrow();

    //Verify transaction
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should buy item", async () => {
    removeCreditStub.returns(true);
    saveStub.returnsThis();

    const result = await buyGift({
      authenticatedUser: {
        _id: "23564",
      },
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Gift");
    expect(result.price).toBe(5);

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });
});