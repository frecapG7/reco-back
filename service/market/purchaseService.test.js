const PurchaseItem = require("../../model/purchase/PurchaseItem");
const User = require("../../model/User");
const sinon = require("sinon");
const {
  paginatedSearch,
  redeem,
  getPurchaseItemFromMarketItem,
  checkPurchaseAvailability,
} = require("./purchaseService");
const ObjectId = require("mongoose").Types.ObjectId;

describe("Validate paginatedSearch", () => {
  const countDocuments = sinon.stub(PurchaseItem, "countDocuments");
  const findStub = sinon.stub(PurchaseItem, "find");

  beforeEach(() => {
    countDocuments.reset();
    findStub.reset();
  });

  it("should return a list of purchases with default values", async () => {
    const expected = sinon.mock();
    countDocuments.returns(1);

    findStub.returns({
      populate: sinon
        .stub()
        .withArgs("item")
        .returns({
          exec: sinon.stub().returns([expected]),
        }),
    });

    const result = await paginatedSearch({});

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(1);

    sinon.assert.calledOnce(countDocuments);
    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(
      findStub,
      {
        name: { $regex: "", $options: "i" },
      },
      null,
      {
        skip: 0,
        limit: 10,
        sort: { "payment_details.purchased_at": 1 },
      }
    );
  });

  it("should return a list of purchases with custom values", async () => {
    const user = sinon.mock();
    const expected = sinon.mock();
    countDocuments.returns(1);

    findStub.returns({
      populate: sinon
        .stub()
        .withArgs("item")
        .returns({
          exec: sinon.stub().returns([expected]),
        }),
    });

    const result = await paginatedSearch({
      search: "toto",
      user,
      type: "Test",
    });

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(1);

    sinon.assert.calledOnce(countDocuments);
    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(
      findStub,
      {
        user,
        name: { $regex: "toto", $options: "i" },
        type: { $in: "Test" },
      },
      null,
      {
        skip: 0,
        limit: 10,
        sort: { "payment_details.purchased_at": 1 },
      }
    );
  });
});

describe("Validate redeem", () => {
  it("Should throw invalid purchase type", async () => {
    const purchase = {
      type: "InvalidPurchase",
    };

    await expect(redeem(purchase)).rejects.toThrow("Invalid purchase type");
  });

  it("should redeem an IconPurchase", async () => {
    const purchase = sinon.mock();
    purchase.type = "IconPurchase";
    purchase.icon = "test-icon";
    purchase.populate = sinon.stub().returnsThis();

    const user = sinon.mock();
    purchase.user = user;
    user.save = sinon.stub().returnsThis();

    const result = await redeem(purchase);

    sinon.assert.calledOnce(user.save);
    expect(user.avatar).toBe("test-icon");
  });
});

describe("Valide getPurchaseItemFromMarketItem", () => {
  let findOneStub;

  beforeEach(() => {
    findOneStub = sinon.stub(PurchaseItem, "findOne");
  });
  afterEach(() => {
    findOneStub.restore();
  });

  it("should return an existing purchase", async () => {
    const user = sinon.mock();

    const existing = sinon.mock();

    findOneStub.returns(existing);

    const result = await getPurchaseItemFromMarketItem(
      {
        _id: "123",
      },
      user
    );

    expect(result).toBe(existing);
    sinon.assert.calledWith(findOneStub, {
      item: "123",
      user,
    });
  });

  it("Should return a new IconPurchase", async () => {
    const user = sinon.mock();

    findOneStub.returns(null);

    const result = await getPurchaseItemFromMarketItem(
      {
        _id: "123",
        name: "Test",
        icon: "test-icon",
        type: "IconItem",
        price: 100,
      },
      user
    );

    expect(result).toBeDefined();
    expect(result.name).toBe("Test");
    expect(result.payment_details.price).toBe(100);
    expect(result.icon).toBe("test-icon");
    expect(result.type).toBe("IconPurchase");

    sinon.assert.calledWith(findOneStub, {
      item: "123",
      user,
    });
  });

  it("Should return a new ConsumablePurchase", async () => {
    const user = sinon.mock();

    findOneStub.returns(null);

    const result = await getPurchaseItemFromMarketItem(
      {
        _id: "123",
        name: "Test",
        icon: "test-icon",
        type: "ConsumableItem",
        price: 100,
      },
      user
    );

    expect(result).toBeDefined();
    expect(result.name).toBe("Test");
    expect(result.payment_details.price).toBe(100);
    expect(result.type).toBe("ConsumablePurchase");

    sinon.assert.calledWith(findOneStub, {
      item: "123",
      user,
    });
  });
});

describe("Validate checkPurchaseAvailability", () => {
  let findOneStub;

  beforeEach(() => {
    findOneStub = sinon.stub(PurchaseItem, "exists");
  });
  afterEach(() => {
    findOneStub.restore();
  });

  it("Should return false if user is not provided", async () => {
    const result = await checkPurchaseAvailability("test", "test");
    expect(result).toBe(false);
  });
  it("Should return false if purchase does not exist", async () => {
    const user = sinon.mock();

    findOneStub.resolves(false);

    const result = await checkPurchaseAvailability("test", "test", user);
    expect(result).toBe(false);

    sinon.assert.calledWith(findOneStub, {
      name: "test",
      type: "test",
      user,
    });
  });

  it("Should return true if purchase exists", async () => {
    const user = sinon.mock();

    findOneStub.resolves(true);

    const result = await checkPurchaseAvailability("test", "test", user);
    expect(result).toBe(true);

    sinon.assert.calledWith(findOneStub, {
      name: "test",
      type: "test",
      user,
    });
  });
});
