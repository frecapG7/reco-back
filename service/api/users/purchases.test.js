const sinon = require("sinon");
const User = require("../../../model/User");
const ObjectId = require("mongoose").Types.ObjectId;

const { getPurchases, getPurchase, redeemPurchase } = require("./purchases");
const purchaseService = require("../../market/purchaseService");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");

const getPurchaseStub = sinon.stub(purchaseService, "getPurchase");
describe("Test getPurchases", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });
  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should return ForbiddenError", async () => {
    await expect(getPurchases({ id: "123" })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should return NotFoundError", async () => {
    findByIdStub.returns(null);

    await expect(
      getPurchases({
        id: "123",
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow("Cannot find user with id 123");
  });

  it("Should return purchases with default values", async () => {
    const user = sinon.mock();
    findByIdStub.returns(user);

    const searchPurchases = sinon.stub(purchaseService, "searchPurchases");

    searchPurchases.returns({
      pagination: {},
      results: [
        {
          name: "Krishna the Wise",
          price: 10,
          url: "https://thisIsValidUrl.com",
        },
      ],
    });

    const result = await getPurchases({
      id: "123",
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
    expect(result.results[0].name).toBe("Krishna the Wise");
    expect(result.results[0].price).toBe(10);

    sinon.assert.calledWith(searchPurchases, {
      user,
      filters: {},
      page: 1,
      pageSize: 10,
    });

    searchPurchases.restore();
  });

  it("Should return purchases with all args", async () => {
    const user = sinon.mock();
    findByIdStub.returns(user);

    const searchPurchases = sinon.stub(purchaseService, "searchPurchases");

    searchPurchases.returns({
      pagination: {},
      results: [
        {
          name: "Krishna the Wise",
          price: 10,
          url: "https://thisIsValidUrl.com",
        },
      ],
    });

    const result = await getPurchases({
      id: "123",
      query: {
        name: "Krishna the Wise",
        status: "active,pending",
        type: "subscription",
        page: 1,
        pageSize: 10,
      },
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
    expect(result.results[0].name).toBe("Krishna the Wise");
    expect(result.results[0].price).toBe(10);

    sinon.assert.calledWith(searchPurchases, {
      user,
      filters: {
        name: "Krishna the Wise",
        status: ["active", "pending"],
        type: ["subscription"],
      },
      page: 1,
      pageSize: 10,
    });

    searchPurchases.restore();
  });
});

describe("Test getPurchase", () => {
  beforeEach(() => {
    getPurchaseStub.reset();
  });

  it("Should return ForbiddenError", async () => {
    await expect(
      getPurchase({
        id: "123",
        purchaseId: "456",
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return purchase", async () => {
    getPurchaseStub.returns({
      _id: "123",
      name: "Krishna the Wise",
      payment_details: {
        price: 10,
        purchased_at: new Date(),
      },
    });

    const result = await getPurchase({
      id: "123",
      purchaseId: "456",
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Krishna the Wise");
    expect(result.payment_details).toBeDefined();
    expect(result.payment_details.price).toBe(10);
  });
});

describe("Test redeemPurchase", () => {
  beforeEach(() => {
    getPurchaseStub.reset();
  });

  it("Should return ForbiddenError", async () => {
    await expect(
      redeemPurchase({
        id: "123",
        purchaseId: "456",
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return NotFoundError", async () => {
    getPurchaseStub.returns(null);

    await expect(
      redeemPurchase({
        id: "123456789123",
        purchaseId: "456",
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow("Cannot find purchase with id 456");
  });

  it("Should redeem purchase", async () => {
    const purchase = sinon.createStubInstance(PurchaseItem);

    getPurchaseStub.returns(purchase);

    const redeemStub = sinon.stub(purchaseService, "redeem").resolvesThis();

    const result = await redeemPurchase({
      id: "123456789123",
      purchaseId: "456",
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    sinon.assert.calledOnce(redeemStub);
    sinon.assert.calledWith(redeemStub, {
      purchase,
    });

    redeemStub.restore();
  });
});
