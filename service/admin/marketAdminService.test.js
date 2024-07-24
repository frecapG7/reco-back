const { createMarketItem, getMarketItem } = require("./marketAdminService");
const { MarketItem } = require("../../model/market/MarketItem");
const {
  UnAuthorizedError,
  UnSupportedTypeError,
  NotFoundError,
} = require("../../errors/error");

const sinon = require("sinon");

describe("Test createMarketItem", () => {
  let marketItemStub;
  beforeEach(() => {
    marketItemStub = sinon.stub(MarketItem.prototype, "save");
  });

  afterEach(() => {
    marketItemStub.restore();
  });

  it("Should throw unAuthorized error", async () => {
    await expect(
      createMarketItem({
        item: {
          type: "Icon",
        },
        authenticatedUser: {
          role: "USER",
        },
      })
    ).rejects.toThrow(UnAuthorizedError);
  });
  it("Should throw UnSupportedTypeError", async () => {
    await expect(
      createMarketItem({
        item: {
          type: "Invalid",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow(UnSupportedTypeError);
  });

  it("Should create icon item", async () => {
    marketItemStub.resolvesThis();

    const result = await expect(
      createMarketItem({
        item: {
          type: "Icon",
          svgContent: "toto",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    );

    expect(result).toBeDefined();
  });
});

describe("Test getMarketItem", () => {
  let marketItemStub;

  beforeEach(() => {
    marketItemStub = sinon.stub(MarketItem, "findById");
  });
  afterEach(() => {
    marketItemStub.restore();
  });

  it("Should throw unAuthorizedError", async () => {
    await expect(
      getMarketItem({
        itemId: "azaeaa112",
        authenticatedUser: {
          role: "USER",
        },
      })
    ).rejects.toThrow(UnAuthorizedError);
  });

  it("Should throw NotFoundError", async () => {
    marketItemStub.withArgs("azaeaa112").resolves(null);
    await expect(
      getMarketItem({
        itemId: "azaeaa112",
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return item", async () => {
    marketItemStub.withArgs("azaeaa112").resolves({
      _id: "expected",
    });

    const result = await getMarketItem({
      itemId: "azaeaa112",
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
    expect(result._id).toEqual("expected");
  });
});
