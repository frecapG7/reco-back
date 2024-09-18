const sinon = require("sinon");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const User = require("../../../model/User");
const ObjectId = require("mongoose").Types.ObjectId;

const { getPurchases } = require("./purchases");

describe("Test getPurchase", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });
  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should return NotFoundError", async () => {
    findByIdStub.returns(null);

    await expect(
      getPurchases({
        id: "123",
      })
    ).rejects.toThrow("Cannot find user with id 123");
  });

  it("Should return ForbiddenError", async () => {
    findByIdStub.returns({
      _id: new ObjectId("123456789123"),
      settings: {
        privacy: {
          privateRequests: true,
        },
      },
    });

    await expect(
      getPurchases({
        id: "123",
        authenticatedUser: {
          id: "456",
        },
      })
    ).rejects.toThrow("User purchases are private");
  });

  it("Should return purchases", async () => {
    findByIdStub.returns({
      _id: new ObjectId("123456789123"),
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });

    const findStub = sinon.stub(PurchaseItem, "find");

    findStub.returns([
      {
        _id: "123",
        name: "Krishna the Wise",
        price: 10,
        url: "https://thisIsValidUrl.com",
      },
    ]);

    const result = await getPurchases({
      id: "123",
      authenticatedUser: {
        id: "123456789123",
      },
    });

    expect(result).toBeDefined();
    expect(result[0].name).toBe("Krishna the Wise");
    expect(result[0].price).toBe(10);

    findStub.restore();
  });
});
