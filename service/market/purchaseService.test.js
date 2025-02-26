const PurchaseItem = require("../../model/purchase/PurchaseItem");
const User = require("../../model/User");
const sinon = require("sinon");
const { searchPurchases, getPurchase, redeem } = require("./purchaseService");
const ObjectId = require("mongoose").Types.ObjectId;

describe("Validate searchPurchases", () => {
  const countDocuments = sinon.stub(PurchaseItem, "countDocuments");
  const findStub = sinon.stub(PurchaseItem, "find");

  const user = new User();

  beforeEach(() => {
    countDocuments.reset();
    findStub.reset();
  });

  it("should return a list of purchases with default values", async () => {
    const expectedResults = [
      {
        name: "Test Purchase",
      },
    ];

    countDocuments.returns(1);
    findStub.returns({
      sort: sinon
        .stub()
        .withArgs("-createdAt")
        .returns({
          skip: sinon
            .stub()
            .withArgs(0)
            .returns({
              limit: sinon
                .stub()
                .withArgs(10)
                .returns({
                  populate: sinon
                    .stub()
                    .withArgs("item")
                    .returns({
                      exec: sinon.stub().returns(expectedResults),
                    }),
                }),
            }),
        }),
    });

    const result = await searchPurchases({
      user,
    });

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(1);
  });

  it("should return a list of purchases with custom values", async () => {
    const expectedResults = [
      {
        name: "Test Purchase",
      },
    ];

    countDocuments.returns(1);
    findStub.returns({
      sort: sinon
        .stub()
        .withArgs("-createdAt")
        .returns({
          skip: sinon
            .stub()
            .withArgs(0)
            .returns({
              limit: sinon
                .stub()
                .withArgs(10)
                .returns({
                  populate: sinon
                    .stub()
                    .withArgs("item")
                    .returns({
                      exec: sinon.stub().returns(expectedResults),
                    }),
                }),
            }),
        }),
    });

    const result = await searchPurchases({
      user,
      filters: {
        name: "Test Purchase",
        type: ["Test"],
        status: ["Test"],
      },
      sort: "createdAt",
      page: 2,
      pageSize: 5,
    });

    expect(result.pagination.currentPage).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(1);

    sinon.assert.calledWith(findStub, {
      user,
      name: { $regex: "Test Purchase", $options: "i" },
      type: { $in: ["Test"] },
      status: { $in: ["Test"] },
    });
  });
});

describe("Validate getPurchase", () => {
  const findOneStub = sinon.stub(PurchaseItem, "findOne");

  beforeEach(() => {
    findOneStub.reset();
  });

  it("should return a purchase", async () => {
    const userId = new ObjectId();
    const purchaseId = new ObjectId();

    findOneStub
      .withArgs({
        user: userId,
        _id: purchaseId,
      })
      .returns({
        exec: sinon.stub().returns({
          name: "Test Purchase",
        }),
      });

    const result = await getPurchase({
      userId,
      purchaseId,
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Test Purchase");
  });
});

describe("Validate redeem", () => {
  const findByIdAndUpdateStub = sinon.stub(User, "findByIdAndUpdate");

  beforeEach(() => {
    findByIdAndUpdateStub.reset();
  });

  it("should throw an error when user is not foun when redeeming an icon purchase", async () => {
    const purchase = {
      type: "IconPurchase",
      user: new ObjectId(),
      icon: "test-icon",
    };

    findByIdAndUpdateStub.returns(null);

    await expect(
      redeem({
        purchase,
      })
    ).rejects.toThrow("User not found");
  });
  it("should redeem an IconPurchase", async () => {
    const purchase = {
      type: "IconPurchase",
      user: new ObjectId(),
      icon: "test-icon",
    };

    const user = {
      _id: purchase.user,
    };

    findByIdAndUpdateStub.returns(user);

    const result = await redeem({
      purchase,
    });

    sinon.assert.calledWith(findByIdAndUpdateStub, purchase.user, {
      avatar: purchase.icon,
    });
  });

  it("Should throw invalid purchase type", async () => {
    const purchase = {
      type: "InvalidPurchase",
    };

    await expect(
      redeem({
        purchase,
      })
    ).rejects.toThrow("Invalid purchase type");
  });
});
