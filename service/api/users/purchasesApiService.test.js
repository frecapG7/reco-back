const sinon = require("sinon");
const User = require("../../../model/User");

const {
  getPurchases,
  getPurchase,
  redeemPurchase,
  createPurchase,
} = require("./purchasesApiService");
const purchaseService = require("../../market/purchaseService");
const creditService = require("../../market/creditService");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const { MarketItem } = require("../../../model/market/MarketItem");

describe("Test getPurchases", () => {
  let paginatedSearchStub;

  beforeEach(() => {
    paginatedSearchStub = sinon.stub(purchaseService, "paginatedSearch");
  });
  afterEach(() => {
    paginatedSearchStub.restore();
  });

  it("Should return ForbiddenError", async () => {
    await expect(getPurchases({ params: { id: "123" } })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should return purchases with default values", async () => {
    const expected = sinon.mock();
    paginatedSearchStub.returns({
      pagination: {},
      results: [expected],
    });

    const result = await getPurchases({
      params: {
        userId: "123",
      },
      user: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledWith(paginatedSearchStub, { user: "123" });
  });

  it("Should return purchases with all args", async () => {
    const expected = sinon.mock();
    paginatedSearchStub.returns({
      pagination: {},
      results: [expected],
    });

    const result = await getPurchases({
      params: {
        userId: "123",
      },
      query: {
        search: "Krishna the Wise",
        type: "subscription",
        page: 1,
        pageSize: 10,
      },
      user: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
    expect(result.results[0]).toBeDefined();

    sinon.assert.calledWith(paginatedSearchStub, {
      user: "123",
      search: "Krishna the Wise",
      type: "subscription",
      page: 1,
      pageSize: 10,
    });
  });
});

describe("Test getPurchase", () => {
  let findOneStub;
  beforeEach(() => {
    findOneStub = sinon.stub(PurchaseItem, "findOne");
  });
  afterEach(() => {
    findOneStub.restore();
  });

  it("Should return ForbiddenError", async () => {
    await expect(
      getPurchase({
        params: {
          id: "123",
          purchaseId: "456",
        },
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw 404 error", async () => {
    findOneStub.returns({
      populate: sinon
        .stub()
        .withArgs("item")
        .returns({
          exec: sinon.stub().resolves(null),
        }),
    });

    await expect(
      getPurchase({
        params: {
          userId: "123",
          purchaseId: "456",
        },
        user: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow("Cannot find purchase with id 456");
  });

  it("Should return purchase", async () => {
    const expected = sinon.mock();

    findOneStub.returns({
      populate: sinon
        .stub()
        .withArgs("item")
        .returns({
          exec: sinon.stub().resolves(expected),
        }),
    });

    const result = await getPurchase({
      params: {
        id: "123",
        purchaseId: "456",
      },
      user: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
    expect(result).toBe(expected);
  });
});

describe("Test redeemPurchase", () => {
  let findOneStub;
  let redeemStub;

  beforeEach(() => {
    findOneStub = sinon.stub(PurchaseItem, "findOne");
    redeemStub = sinon.stub(purchaseService, "redeem");
  });

  afterEach(() => {
    findOneStub.restore();
    redeemStub.restore();
  });

  it("Should return ForbiddenError", async () => {
    await expect(
      redeemPurchase({
        params: {
          userId: "123",
          purchaseId: "456",
        },
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return NotFoundError", async () => {
    findOneStub.returns(null);

    await expect(
      redeemPurchase({
        params: {
          userId: "123456789123",
          purchaseId: "456",
        },
        user: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow("Cannot find purchase with id 456");
  });

  it("Should redeem purchase", async () => {
    const purchase = sinon.mock(PurchaseItem);
    findOneStub.returns(purchase);

    redeemStub.resolvesThis();

    const result = await redeemPurchase({
      params: {
        userId: "123456789123",
        purchaseId: "456",
      },
      user: {
        role: "ADMIN",
      },
    });

    sinon.assert.calledOnce(redeemStub);
    sinon.assert.calledWith(redeemStub, purchase);
  });
});

describe("Test createPurchase", () => {
  let userFindByIdStub;
  let marketFindByIdStub;
  let getPurchaseItemFromMarketItemStub;
  let removeCreditStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
    marketFindByIdStub = sinon.stub(MarketItem, "findById");
    getPurchaseItemFromMarketItemStub = sinon.stub(
      purchaseService,
      "getPurchaseItemFromMarketItem"
    );
    removeCreditStub = sinon.stub(creditService, "removeCredit");
  });
  afterEach(() => {
    userFindByIdStub.restore();
    marketFindByIdStub.restore();
    getPurchaseItemFromMarketItemStub.restore();
    removeCreditStub.restore();
  });

  it("Should return ForbiddenError", async () => {
    await expect(
      createPurchase({
        params: {
          userId: "123",
        },
        body: {
          item: {
            id: "456",
          },
        },
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return an user not found error", async () => {
    userFindByIdStub.returns(null);

    await expect(
      createPurchase({
        params: {
          userId: "123",
        },
        body: {
          item: {
            id: "456",
          },
        },
        user: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow("Cannot find user with id 123");
  });

  it("Should return an error on market item not found", async () => {
    const user = sinon.mock();
    userFindByIdStub.returns(user);

    marketFindByIdStub.returns(null);
    await expect(
      createPurchase({
        params: {
          userId: "123",
        },
        body: {
          item: {
            id: "456",
          },
        },
        user: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow("Cannot find store item with id 456");

    sinon.assert.calledWith(marketFindByIdStub, "456");
  });

  it("Should return an error on market item not enabled", async () => {
    userFindByIdStub.returns({});

    marketFindByIdStub.returns({
      enabled: false,
    });
    await expect(
      createPurchase({
        params: {
          userId: "123",
        },
        body: {
          item: {
            id: "456",
          },
        },
        user: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow("Cannot find store item with id 456");

    sinon.assert.calledWith(marketFindByIdStub, "456");
  });

  it("Should return a new purchase", async () => {
    const user = sinon.mock();
    userFindByIdStub.returns(user);

    const marketItem = sinon.mock();
    marketFindByIdStub.returns(marketItem);
    marketItem.enabled = true;
    marketItem.price = 10;

    const purchaseItem = sinon.mock();
    getPurchaseItemFromMarketItemStub.returns(purchaseItem);
    purchaseItem.save = sinon.stub().resolvesThis();

    removeCreditStub.resolvesThis();

    const result = await createPurchase({
      params: {
        userId: "123",
      },
      body: {
        item: {
          id: "456",
        },
      },
      user: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledWith(
      getPurchaseItemFromMarketItemStub,
      marketItem,
      user
    );

    sinon.assert.calledWith(removeCreditStub, 10, user);
  });
});
