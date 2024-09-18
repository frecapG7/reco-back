const sinon = require("sinon");
const {
  NotFoundError,
  UnprocessableEntityError,
} = require("../../errors/error");
const { MarketItem } = require("../../model/market/MarketItem");
const IconPurchase = require("../../model/purchase/IconPurchase");
const ConsumablePurchase = require("../../model/purchase/ConsumablePurchase");

const marketService = require("./marketService");

const mongoose = require("mongoose");
const creditService = require("./creditService");
const PurchaseItem = require("../../model/purchase/PurchaseItem");

describe("Should validate getItem", () => {
  let marketItemStub;

  beforeEach(() => {
    marketItemStub = sinon.stub(MarketItem, "findById");
  });
  afterEach(() => {
    marketItemStub.restore();
  });

  it("Should thrown NotFoundError", async () => {
    marketItemStub.withArgs("12345").returns(null);

    await expect(marketService.getItem({ id: "12345" })).rejects.toThrow(
      NotFoundError
    );
  });

  it("Should thrown UnprocessableEntityError", async () => {
    marketItemStub.withArgs("12345").returns({
      enabled: false,
    });

    await expect(marketService.getItem({ id: "12345" })).rejects.toThrow(
      UnprocessableEntityError
    );
  });

  it("Should test happy path", async () => {
    marketItemStub.withArgs("12345").returns({
      enabled: true,
    });

    const result = await expect(marketService.getItem({ id: "12345" }));
    expect(result).toBeDefined();
  });
});

describe("Should validate searchItems", () => {
  const countDocumentsStub = sinon.stub(MarketItem, "countDocuments");
  const findStub = sinon.stub(MarketItem, "find");

  beforeEach(() => {
    countDocumentsStub.reset();
    findStub.reset();
  });

  it("Should return happy path with default values", async () => {
    countDocumentsStub.returns(10);
    findStub.returns({
      skip: () => ({
        limit: () => ({
          exec: () => {
            return [
              {
                name: "name",
                label: "label",
                title: "title",
                description: "description",
                price: 10,
                disable: false,
                created_by: "12345",
                created_at: new Date(),
                tags: ["tag1", "tag2"],
              },
            ];
          },
        }),
      }),
    });

    const result = await marketService.searchItems({
      value: "name",
    });

    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(1);
    expect(result.pagination.totalResults).toEqual(10);
    expect(result.results.length).toEqual(1);
  });
});

describe("Should validate buyItem", () => {
  let removeCreditStub;
  let mongooseStub;

  beforeEach(() => {
    removeCreditStub = sinon.stub(creditService, "removeCredit");
    mongooseStub = sinon.stub(mongoose, "startSession");
  });

  afterEach(() => {
    removeCreditStub.restore();
    mongooseStub.restore();
  });

  it("Should rollback transaction", async () => {
    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongooseStub.returns(sessionStub);

    removeCreditStub.throws();

    await expect(
      marketService.buyItem({
        name: "name",
        value: "value",
        price: 10,
        user: {
          _id: "23564",
        },
        marketItem: "marketItem",
      })
    ).rejects.toThrow();

    //Verify transaction
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should buy icon item ", async () => {
    removeCreditStub.returns(true);

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongooseStub.returns(sessionStub);

    removeCreditStub.resolves();
    sinon.stub(IconPurchase.prototype, "save").returnsThis();

    const result = await marketService.buyItem({
      marketItem: {
        name: "name",
        url: "value",
        price: 10,
        type: "IconItem",
      },
      user: {
        _id: "23564",
      },
    });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(IconPurchase);
    expect(result.icon).toEqual("value");
    expect(result.name).toEqual("name");
    expect(result.payment_details.price).toEqual(10);
    expect(result.payment_details.purchased_at).toBeDefined();

    //Verify transaction
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();

    sinon.assert.calledWith(removeCreditStub, 10, { _id: "23564" });
  });

  it("Should buy consumable item ", async () => {
    removeCreditStub.returns(true);

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongooseStub.returns(sessionStub);

    removeCreditStub.resolves();
    sinon.stub(ConsumablePurchase.prototype, "save").returnsThis();

    const result = await marketService.buyItem({
      marketItem: {
        name: "name",
        url: "value",
        price: 10,
        type: "ConsumableItem",
      },
      user: {
        _id: "23564",
      },
    });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(ConsumablePurchase);
    expect(result.name).toEqual("name");
    expect(result.payment_details.price).toEqual(10);
    expect(result.payment_details.purchased_at).toBeDefined();

    //Verify transaction
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();

    sinon.assert.calledWith(removeCreditStub, 10, { _id: "23564" });
  });
});
